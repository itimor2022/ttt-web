import React, { Component } from "react";
import { LocationData } from "../../module";
import "./index.css";

interface LocationPickerProps {
    amapKey: string;
    onSelect: (location: LocationData) => void;
    onClose: () => void;
}

interface POI {
    id: string;
    name: string;
    address: string;
    location: { lng: number; lat: number };
    distance?: number;
}

interface LocationPickerState {
    loading: boolean;
    currentLocation: { lng: number; lat: number } | null;
    searchKeyword: string;
    searchResults: POI[];
    nearbyPOIs: POI[];
    selectedPOI: POI | null;
    error: string;
    searching: boolean;
}

export default class LocationPicker extends Component<LocationPickerProps, LocationPickerState> {
    private mapContainer: HTMLDivElement | null = null;
    private map: any = null;
    private marker: any = null;
    private searchTimeout: any = null;

    constructor(props: LocationPickerProps) {
        super(props);
        this.state = {
            loading: true,
            currentLocation: null,
            searchKeyword: "",
            searchResults: [],
            nearbyPOIs: [],
            selectedPOI: null,
            error: "",
            searching: false,
        };
    }

    componentDidMount() {
        this.loadAMapScript();
    }

    componentWillUnmount() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        if (this.map) {
            this.map.destroy();
        }
    }

    loadAMapScript = () => {
        const { amapKey } = this.props;

        // 检查是否已加载
        if ((window as any).AMap) {
            this.initMap();
            return;
        }

        // 动态加载高德地图 JS API
        const script = document.createElement("script");
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Geocoder,AMap.PlaceSearch,AMap.Geolocation`;
        script.async = true;
        script.onload = () => {
            this.initMap();
        };
        script.onerror = () => {
            this.setState({ loading: false, error: "地图加载失败" });
        };
        document.head.appendChild(script);
    };

    initMap = () => {
        const AMap = (window as any).AMap;
        if (!this.mapContainer || !AMap) return;

        // 创建地图
        this.map = new AMap.Map(this.mapContainer, {
            zoom: 15,
            center: [116.397428, 39.90923], // 默认北京
        });

        // 创建标记
        this.marker = new AMap.Marker({
            position: this.map.getCenter(),
            draggable: true,
        });
        this.map.add(this.marker);

        // 标记拖拽结束
        this.marker.on("dragend", () => {
            const pos = this.marker.getPosition();
            this.updateLocation(pos.lng, pos.lat);
        });

        // 地图点击
        this.map.on("click", (e: any) => {
            const { lng, lat } = e.lnglat;
            this.marker.setPosition([lng, lat]);
            this.updateLocation(lng, lat);
        });

        // 获取当前位置
        this.getCurrentLocation();
    };

    getCurrentLocation = () => {
        const AMap = (window as any).AMap;
        
        // 使用浏览器定位
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    this.setMapCenter(longitude, latitude);
                    this.updateLocation(longitude, latitude);
                },
                () => {
                    // 定位失败，使用IP定位
                    this.ipLocation();
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        } else {
            this.ipLocation();
        }
    };

    ipLocation = () => {
        // IP定位作为备选
        const AMap = (window as any).AMap;
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: false,
            timeout: 10000,
        });
        
        geolocation.getCityInfo((status: string, result: any) => {
            if (status === "complete" && result.center) {
                const [lng, lat] = result.center;
                this.setMapCenter(lng, lat);
                this.updateLocation(lng, lat);
            } else {
                this.setState({ loading: false });
            }
        });
    };

    setMapCenter = (lng: number, lat: number) => {
        if (this.map && this.marker) {
            this.map.setCenter([lng, lat]);
            this.marker.setPosition([lng, lat]);
            this.setState({ currentLocation: { lng, lat } });
        }
    };

    updateLocation = (lng: number, lat: number) => {
        this.setState({ currentLocation: { lng, lat }, loading: false });
        this.searchNearby(lng, lat);
    };

    searchNearby = async (lng: number, lat: number) => {
        const { amapKey } = this.props;
        
        try {
            // 使用高德 Web API 搜索周边
            const response = await fetch(
                `https://restapi.amap.com/v3/place/around?key=${amapKey}&location=${lng},${lat}&radius=1000&types=&offset=20`
            );
            const data = await response.json();
            
            if (data.status === "1" && data.pois) {
                const pois: POI[] = data.pois.map((poi: any) => {
                    const [pLng, pLat] = poi.location.split(",").map(Number);
                    return {
                        id: poi.id,
                        name: poi.name,
                        address: poi.address || poi.pname + poi.cityname + poi.adname,
                        location: { lng: pLng, lat: pLat },
                        distance: poi.distance ? parseInt(poi.distance) : 0,
                    };
                });
                this.setState({ nearbyPOIs: pois });
                
                // 自动选中第一个
                if (pois.length > 0 && !this.state.selectedPOI) {
                    this.setState({ selectedPOI: pois[0] });
                }
            }
        } catch (e) {
            console.error("搜索周边失败", e);
        }
    };

    handleSearch = (keyword: string) => {
        this.setState({ searchKeyword: keyword });

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (!keyword.trim()) {
            this.setState({ searchResults: [] });
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this.doSearch(keyword);
        }, 300);
    };

    doSearch = async (keyword: string) => {
        const { amapKey } = this.props;
        const { currentLocation } = this.state;
        
        this.setState({ searching: true });

        try {
            let url = `https://restapi.amap.com/v3/place/text?key=${amapKey}&keywords=${encodeURIComponent(keyword)}&offset=20`;
            if (currentLocation) {
                url += `&location=${currentLocation.lng},${currentLocation.lat}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "1" && data.pois) {
                const pois: POI[] = data.pois.map((poi: any) => {
                    const [lng, lat] = poi.location.split(",").map(Number);
                    return {
                        id: poi.id,
                        name: poi.name,
                        address: poi.address || poi.pname + poi.cityname + poi.adname,
                        location: { lng, lat },
                    };
                });
                this.setState({ searchResults: pois });
            }
        } catch (e) {
            console.error("搜索失败", e);
        } finally {
            this.setState({ searching: false });
        }
    };

    handleSelectPOI = (poi: POI) => {
        this.setState({ selectedPOI: poi, searchKeyword: "", searchResults: [] });
        this.setMapCenter(poi.location.lng, poi.location.lat);
    };

    handleConfirm = () => {
        const { onSelect } = this.props;
        const { selectedPOI, currentLocation } = this.state;

        if (selectedPOI) {
            onSelect({
                lng: selectedPOI.location.lng,
                lat: selectedPOI.location.lat,
                title: selectedPOI.name,
                address: selectedPOI.address,
                img: this.getStaticMapUrl(selectedPOI.location.lng, selectedPOI.location.lat),
            });
        } else if (currentLocation) {
            onSelect({
                lng: currentLocation.lng,
                lat: currentLocation.lat,
                title: "我的位置",
                address: "当前位置",
                img: this.getStaticMapUrl(currentLocation.lng, currentLocation.lat),
            });
        }
    };

    getStaticMapUrl = (lng: number, lat: number): string => {
        const { amapKey } = this.props;
        return `https://restapi.amap.com/v3/staticmap?location=${lng},${lat}&zoom=15&size=400*200&markers=mid,,A:${lng},${lat}&key=${amapKey}`;
    };

    render() {
        const { onClose } = this.props;
        const { loading, error, searchKeyword, searchResults, nearbyPOIs, selectedPOI, searching } = this.state;

        const displayList = searchKeyword.trim() ? searchResults : nearbyPOIs;

        return (
            <div className="wk-location-picker">
                {/* 头部 */}
                <div className="wk-location-picker-header">
                    <button className="wk-location-picker-close" onClick={onClose}>
                        取消
                    </button>
                    <span className="wk-location-picker-title">选择位置</span>
                    <button
                        className="wk-location-picker-confirm"
                        onClick={this.handleConfirm}
                        disabled={!selectedPOI}
                    >
                        发送
                    </button>
                </div>

                {/* 搜索框 */}
                <div className="wk-location-picker-search">
                    <input
                        type="text"
                        placeholder="搜索地点"
                        value={searchKeyword}
                        onChange={(e) => this.handleSearch(e.target.value)}
                    />
                    {searching && <span className="wk-location-picker-searching">搜索中...</span>}
                </div>

                {/* 内容区 */}
                <div className="wk-location-picker-content">
                    {/* 地图 */}
                    <div className="wk-location-picker-map" ref={(ref) => (this.mapContainer = ref)}>
                        {loading && <div className="wk-location-picker-loading">加载中...</div>}
                        {error && <div className="wk-location-picker-error">{error}</div>}
                    </div>

                    {/* POI列表 */}
                    <div className="wk-location-picker-list">
                        {displayList.length === 0 ? (
                            <div className="wk-location-picker-empty">
                                {searchKeyword.trim() ? "未找到相关地点" : "暂无附近地点"}
                            </div>
                        ) : (
                            displayList.map((poi) => (
                                <div
                                    key={poi.id}
                                    className={`wk-location-picker-item ${selectedPOI?.id === poi.id ? "selected" : ""}`}
                                    onClick={() => this.handleSelectPOI(poi)}
                                >
                                    <div className="wk-location-picker-item-icon">
                                        📍
                                    </div>
                                    <div className="wk-location-picker-item-info">
                                        <div className="wk-location-picker-item-name">{poi.name}</div>
                                        <div className="wk-location-picker-item-address">
                                            {poi.address}
                                            {poi.distance !== undefined && poi.distance > 0 && (
                                                <span className="wk-location-picker-item-distance">
                                                    {poi.distance < 1000 ? `${poi.distance}m` : `${(poi.distance / 1000).toFixed(1)}km`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedPOI?.id === poi.id && (
                                        <div className="wk-location-picker-item-check">✓</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }
}


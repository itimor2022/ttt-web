import { IModule, WKApp } from "@tsdaodao/base";
import React from "react";
import LocationToolbar from "./Components/LocationToolbar";
import "./styles.css";

// 高德地图Web API Key - 需要在 https://console.amap.com 申请
// 注意：这里使用的是 Web服务 API Key，不是 JS API Key
const AMAP_WEB_KEY = "YOUR_AMAP_WEB_KEY";

export default class MapModule implements IModule {
    private amapKey: string = AMAP_WEB_KEY;

    id(): string {
        return "MapModule";
    }

    // 设置高德地图 Key
    setAmapKey(key: string) {
        this.amapKey = key;
    }

    getAmapKey(): string {
        return this.amapKey;
    }

    init(): void {
        console.log("【MapModule】初始化");

        // 注册位置发送工具栏
        WKApp.endpoints.registerChatToolbar("chattoolbar.location", (ctx) => {
            return (
                <LocationToolbar
                    conversationContext={ctx}
                    icon={require("./assets/func_location.svg").default}
                />
            );
        });

        // 扩展 WKApp.shared 添加打开位置选择的方法
        (WKApp.shared as any).openLocationPicker = this.openLocationPicker.bind(this);
        (WKApp.shared as any).mapModule = this;

        console.log("【MapModule】位置功能已注册");
    }

    // 打开位置选择器
    openLocationPicker(callback: (location: LocationData) => void): void {
        import("./Components/LocationPicker").then(({ default: LocationPicker }) => {
            const onClose = () => {
                WKApp.shared.baseContext?.hideGlobalModal?.();
            };

            const onSelect = (location: LocationData) => {
                callback(location);
                onClose();
            };

            WKApp.shared.baseContext?.showGlobalModal?.({
                body: (
                    <LocationPicker
                        amapKey={this.amapKey}
                        onSelect={onSelect}
                        onClose={onClose}
                    />
                ),
                footer: null,
                closable: false,
                className: "wk-map-modal",
                width: "700px",
                onCancel: onClose,
            });
        });
    }
}

// 位置数据接口
export interface LocationData {
    lng: number;        // 经度
    lat: number;        // 纬度
    title: string;      // 位置名称
    address: string;    // 详细地址
    img?: string;       // 静态地图图片URL（可选）
}


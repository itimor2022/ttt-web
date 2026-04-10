import React, { Component } from "react";
import { WKApp } from "@tsdaodao/base";
import "./index.css";

// 红包领取记录
interface GrabRecord {
    uid: string;
    name: string;
    avatar: string;
    amount: number;
    grabTime: string;  // 后端返回字符串格式
    isLucky: boolean; // 是否是手气最佳
}

// 红包详情数据
interface RedPacketDetailData {
    packetNo: string;
    senderUid: string;
    senderName: string;
    senderAvatar: string;
    remark: string;
    totalAmount: number;
    totalCount: number;
    grabbedAmount: number;
    grabbedCount: number;
    myGrabAmount: number;
    status: number;
    createdAt: string;  // 后端返回字符串格式
    grabRecords: GrabRecord[];
}

interface Props {
    packetNo: string;
    onClose?: () => void;
}

interface State {
    loading: boolean;
    detail: RedPacketDetailData | null;
    error: string;
}

export default class RedPacketDetailPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            detail: null,
            error: "",
        };
    }

    componentDidMount() {
        this.loadDetail();
    }

    loadDetail = async () => {
        try {
            const res = await WKApp.apiClient.get(`/wallet/redpacket/${this.props.packetNo}`);
            this.setState({
                loading: false,
                detail: {
                    packetNo: res.packet_no || this.props.packetNo,
                    senderUid: res.sender_uid || "",
                    senderName: res.sender_name || "",
                    senderAvatar: res.sender_avatar || "",
                    remark: res.remark || "恭喜发财，大吉大利",
                    totalAmount: res.total_amount || 0,
                    totalCount: res.total_count || 0,
                    grabbedAmount: res.grabbed_amount || 0,
                    grabbedCount: res.grabbed_count || 0,
                    myGrabAmount: res.my_grab_amount || 0,
                    status: res.status || 0,
                    createdAt: res.created_at || "",
                    grabRecords: (res.grab_records || []).map((r: any) => ({
                        uid: r.uid || "",
                        name: r.name || "",
                        avatar: r.avatar || "",
                        amount: r.amount || 0,
                        grabTime: r.grab_time || "",
                        isLucky: r.is_lucky || false,
                    })),
                },
            });
        } catch (err: any) {
            this.setState({
                loading: false,
                error: err.message || "加载失败",
            });
        }
    };

    formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        // 后端返回的是字符串格式，直接显示
        return timeStr;
    };

    formatAmount = (amount: number) => {
        return (amount / 100).toFixed(2);
    };

    getStatusText = () => {
        const { detail } = this.state;
        if (!detail) return "";
        switch (detail.status) {
            case 0: return "";
            case 1: return "已抢完";
            case 2: return "已过期";
            default: return "";
        }
    };

    render() {
        const { onClose } = this.props;
        const { loading, detail, error } = this.state;

        if (loading) {
            return (
                <div className="wk-redpacket-detail-page">
                    <div className="wk-redpacket-detail-loading">加载中...</div>
                </div>
            );
        }

        if (error || !detail) {
            return (
                <div className="wk-redpacket-detail-page">
                    <div className="wk-redpacket-detail-error">{error || "加载失败"}</div>
                </div>
            );
        }

        return (
            <div className="wk-redpacket-detail-page">
                {/* 顶部 */}
                <div className="wk-redpacket-detail-header">
                    {onClose && (
                        <button className="wk-redpacket-detail-close" onClick={onClose}>
                            ✕
                        </button>
                    )}
                    <div className="wk-redpacket-detail-sender">
                        <img
                            src={detail.senderAvatar || "/default-avatar.png"}
                            alt=""
                            className="wk-redpacket-detail-avatar"
                        />
                        <span className="wk-redpacket-detail-name">{detail.senderName}的红包</span>
                    </div>
                    <div className="wk-redpacket-detail-remark">{detail.remark}</div>
                </div>

                {/* 金额区域 */}
                <div className="wk-redpacket-detail-amount-section">
                    {detail.myGrabAmount > 0 ? (
                        <>
                            <div className="wk-redpacket-detail-amount">
                                <span className="wk-amount-value">{this.formatAmount(detail.myGrabAmount)}</span>
                                <span className="wk-amount-unit">元</span>
                            </div>
                            <div className="wk-redpacket-detail-tip">已存入零钱</div>
                        </>
                    ) : (
                        <div className="wk-redpacket-detail-tip">
                            {this.getStatusText() || "未领取"}
                        </div>
                    )}
                </div>

                {/* 领取记录 */}
                <div className="wk-redpacket-detail-records">
                    <div className="wk-redpacket-detail-records-header">
                        <span>已领取 {detail.grabbedCount}/{detail.totalCount} 个，共 {this.formatAmount(detail.grabbedAmount)}/{this.formatAmount(detail.totalAmount)} 元</span>
                    </div>
                    <div className="wk-redpacket-detail-records-list">
                        {detail.grabRecords.map((record, index) => (
                            <div key={index} className="wk-redpacket-detail-record-item">
                                <img
                                    src={record.avatar || "/default-avatar.png"}
                                    alt=""
                                    className="wk-record-avatar"
                                />
                                <div className="wk-record-info">
                                    <div className="wk-record-name">
                                        {record.name}
                                        {record.isLucky && <span className="wk-lucky-tag">手气最佳</span>}
                                    </div>
                                    <div className="wk-record-time">{this.formatTime(record.grabTime)}</div>
                                </div>
                                <div className="wk-record-amount">{this.formatAmount(record.amount)}元</div>
                            </div>
                        ))}
                        {detail.grabRecords.length === 0 && (
                            <div className="wk-redpacket-detail-empty">暂无领取记录</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}


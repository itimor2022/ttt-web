import React, { Component } from "react";
import { WKApp } from "@tsdaodao/base";
import "./index.css";

// 转账详情数据
interface TransferDetailData {
    transferNo: string;
    fromUid: string;
    fromName: string;
    fromAvatar: string;
    toUid: string;
    toName: string;
    toAvatar: string;
    amount: number;
    remark: string;
    status: number;  // 0:待领取 1:已领取 2:已退回 3:已过期
    createdAt: string;  // 后端返回字符串格式
    receivedAt: string;
}

interface Props {
    transferNo: string;
    onClose?: () => void;
}

interface State {
    loading: boolean;
    detail: TransferDetailData | null;
    error: string;
    receiving: boolean;
}

export default class TransferDetailPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            detail: null,
            error: "",
            receiving: false,
        };
    }

    componentDidMount() {
        this.loadDetail();
    }

    loadDetail = async () => {
        try {
            const res = await WKApp.apiClient.get(`/wallet/transfer/${this.props.transferNo}`);
            this.setState({
                loading: false,
                detail: {
                    transferNo: res.transfer_no || this.props.transferNo,
                    fromUid: res.from_uid || "",
                    fromName: res.from_name || "",
                    fromAvatar: res.from_avatar || "",
                    toUid: res.to_uid || "",
                    toName: res.to_name || "",
                    toAvatar: res.to_avatar || "",
                    amount: res.amount || 0,
                    remark: res.remark || "",
                    status: res.status || 0,
                    createdAt: res.created_at || "",
                    receivedAt: res.received_at || "",
                },
            });
        } catch (err: any) {
            this.setState({
                loading: false,
                error: err.message || "加载失败",
            });
        }
    };

    handleReceive = async () => {
        const { detail } = this.state;
        if (!detail || detail.status !== 0) return;

        // 检查是否是接收者
        if (detail.toUid !== WKApp.loginInfo.uid) {
            alert("这笔转账不是给你的");
            return;
        }

        this.setState({ receiving: true });
        try {
            await WKApp.apiClient.post(`/wallet/transfer/${detail.transferNo}/receive`);
            // 刷新详情
            this.loadDetail();
        } catch (err: any) {
            alert(err.message || "领取失败");
        } finally {
            this.setState({ receiving: false });
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

    getStatusText = (status: number) => {
        switch (status) {
            case 0: return "待领取";
            case 1: return "已领取";
            case 2: return "已退回";
            case 3: return "已过期";
            default: return "";
        }
    };

    render() {
        const { onClose } = this.props;
        const { loading, detail, error, receiving } = this.state;

        if (loading) {
            return (
                <div className="wk-transfer-detail-page">
                    <div className="wk-transfer-detail-loading">加载中...</div>
                </div>
            );
        }

        if (error || !detail) {
            return (
                <div className="wk-transfer-detail-page">
                    <div className="wk-transfer-detail-error">{error || "加载失败"}</div>
                </div>
            );
        }

        const isSender = detail.fromUid === WKApp.loginInfo.uid;
        const isReceiver = detail.toUid === WKApp.loginInfo.uid;
        const canReceive = isReceiver && detail.status === 0;

        return (
            <div className="wk-transfer-detail-page">
                {/* 顶部 */}
                <div className="wk-transfer-detail-header">
                    {onClose && (
                        <button className="wk-transfer-detail-close" onClick={onClose}>
                            ✕
                        </button>
                    )}
                    <div className="wk-transfer-detail-icon">💰</div>
                    <div className="wk-transfer-detail-title">
                        {isSender ? `转账给${detail.toName}` : `${detail.fromName}的转账`}
                    </div>
                </div>

                {/* 金额区域 */}
                <div className="wk-transfer-detail-amount-section">
                    <div className="wk-transfer-detail-amount">
                        <span className="wk-amount-symbol">¥</span>
                        <span className="wk-amount-value">{this.formatAmount(detail.amount)}</span>
                    </div>
                    {detail.remark && (
                        <div className="wk-transfer-detail-remark">{detail.remark}</div>
                    )}
                    <div className={`wk-transfer-detail-status status-${detail.status}`}>
                        {this.getStatusText(detail.status)}
                    </div>
                </div>

                {/* 详细信息 */}
                <div className="wk-transfer-detail-info">
                    <div className="wk-transfer-detail-info-item">
                        <span className="wk-info-label">转账方</span>
                        <span className="wk-info-value">{detail.fromName}</span>
                    </div>
                    <div className="wk-transfer-detail-info-item">
                        <span className="wk-info-label">收款方</span>
                        <span className="wk-info-value">{detail.toName}</span>
                    </div>
                    <div className="wk-transfer-detail-info-item">
                        <span className="wk-info-label">转账时间</span>
                        <span className="wk-info-value">{this.formatTime(detail.createdAt)}</span>
                    </div>
                    {detail.receivedAt && (
                        <div className="wk-transfer-detail-info-item">
                            <span className="wk-info-label">收款时间</span>
                            <span className="wk-info-value">{this.formatTime(detail.receivedAt)}</span>
                        </div>
                    )}
                    <div className="wk-transfer-detail-info-item">
                        <span className="wk-info-label">转账单号</span>
                        <span className="wk-info-value wk-info-mono">{detail.transferNo}</span>
                    </div>
                </div>

                {/* 操作按钮 */}
                {canReceive && (
                    <div className="wk-transfer-detail-actions">
                        <button
                            className="wk-transfer-receive-btn"
                            onClick={this.handleReceive}
                            disabled={receiving}
                        >
                            {receiving ? "领取中..." : "领取转账"}
                        </button>
                    </div>
                )}
            </div>
        );
    }
}


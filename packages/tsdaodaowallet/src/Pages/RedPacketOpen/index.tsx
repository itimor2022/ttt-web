import React, { Component } from "react";
import { WKApp } from "@tsdaodao/base";
import "./index.css";

interface Props {
    packetNo: string;
    onClose?: () => void;
    onOpenSuccess?: (amount: number) => void;
    onViewDetail?: () => void;
}

interface State {
    loading: boolean;
    senderName: string;
    senderAvatar: string;
    remark: string;
    status: number;
    grabAmount: number;
    opening: boolean;
    error: string;
}

export default class RedPacketOpenPage extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            senderName: "",
            senderAvatar: "",
            remark: "",
            status: 0,
            grabAmount: 0,
            opening: false,
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
                senderName: res.sender_name || "",
                senderAvatar: res.sender_avatar || "",
                remark: res.remark || "恭喜发财，大吉大利",
                status: res.status || 0,
                grabAmount: res.my_grab_amount || 0,
            });
        } catch (err: any) {
            this.setState({
                loading: false,
                error: err.message || "加载失败",
            });
        }
    };

    handleOpen = async () => {
        this.setState({ opening: true });
        try {
            const res = await WKApp.apiClient.post(`/wallet/redpacket/${this.props.packetNo}/grab`);
            const amount = res.amount || 0;
            this.setState({
                opening: false,
                grabAmount: amount,
            });
            this.props.onOpenSuccess?.(amount);
        } catch (err: any) {
            this.setState({ opening: false });
            alert(err.message || "领取失败");
        }
    };

    formatAmount = (amount: number) => {
        return (amount / 100).toFixed(2);
    };

    render() {
        const { onClose, onViewDetail } = this.props;
        const { loading, senderName, senderAvatar, remark, status, grabAmount, opening, error } = this.state;

        const hasGrabbed = grabAmount > 0;
        const canGrab = !hasGrabbed && status === 0;

        return (
            <div className="wk-redpacket-open-overlay" onClick={onClose}>
                <div className="wk-redpacket-open-container" onClick={(e) => e.stopPropagation()}>
                    {/* 关闭按钮 */}
                    <button className="wk-redpacket-open-close" onClick={onClose}>✕</button>

                    {loading ? (
                        <div className="wk-redpacket-open-loading">加载中...</div>
                    ) : error ? (
                        <div className="wk-redpacket-open-error">{error}</div>
                    ) : (
                        <>
                            {/* 发送者信息 */}
                            <div className="wk-redpacket-open-header">
                                <img
                                    src={senderAvatar || "/default-avatar.png"}
                                    alt=""
                                    className="wk-redpacket-open-avatar"
                                />
                                <div className="wk-redpacket-open-name">{senderName}的红包</div>
                                <div className="wk-redpacket-open-remark">{remark}</div>
                            </div>

                            {/* 已领取显示金额 */}
                            {hasGrabbed && (
                                <div className="wk-redpacket-open-amount-section">
                                    <div className="wk-redpacket-open-amount">
                                        <span className="wk-open-amount-value">{this.formatAmount(grabAmount)}</span>
                                        <span className="wk-open-amount-unit">元</span>
                                    </div>
                                </div>
                            )}

                            {/* 开按钮或状态提示 */}
                            {canGrab && (
                                <button
                                    className={`wk-redpacket-open-btn ${opening ? "opening" : ""}`}
                                    onClick={this.handleOpen}
                                    disabled={opening}
                                >
                                    {opening ? "..." : "開"}
                                </button>
                            )}

                            {status === 1 && !hasGrabbed && (
                                <div className="wk-redpacket-open-tip">红包已抢完</div>
                            )}
                            {status === 2 && !hasGrabbed && (
                                <div className="wk-redpacket-open-tip">红包已过期</div>
                            )}

                            {/* 查看详情链接 */}
                            {(hasGrabbed || status > 0) && (
                                <button className="wk-redpacket-open-detail-link" onClick={onViewDetail}>
                                    查看红包详情
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}


import React, { Component } from "react";
import { ConversationContext, WKApp } from "@tsdaodao/base";
import { ChannelTypeGroup } from "wukongimjssdk";
import { RedPacketContent } from "../../Messages/RedPacket";
import WalletService from "../../Service";
import PayKeyboard from "../../Components/PayKeyboard";
import "./index.css";

interface RedPacketSendPageProps {
    channelId: string;
    channelType: number;
    conversationContext: ConversationContext;
    onClose: () => void;
    onSendSuccess: (packetNo: string) => void;
}

interface RedPacketSendPageState {
    amount: string;
    count: string;
    remark: string;
    payPassword: string;
    step: "input" | "password";
    loading: boolean;
    error: string;
    redPacketType: number;
    balance: number;
    balanceLoading: boolean;
}

export default class RedPacketSendPage extends Component<RedPacketSendPageProps, RedPacketSendPageState> {
    constructor(props: RedPacketSendPageProps) {
        super(props);
        this.state = {
            amount: "",
            count: props.channelType === ChannelTypeGroup ? "10" : "1",
            remark: "",
            payPassword: "",
            step: "input",
            loading: false,
            error: "",
            redPacketType: props.channelType === ChannelTypeGroup ? 2 : 1,
            balance: 0,
            balanceLoading: true,
        };
    }

    componentDidMount() {
        this.loadBalance();
    }

    async loadBalance() {
        try {
            const result = await WalletService.shared.getBalance();
            this.setState({ balance: result.balance, balanceLoading: false });
        } catch {
            this.setState({ balanceLoading: false });
        }
    }

    handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            this.setState({ amount: value, error: "" });
        }
    };

    handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && parseInt(value || "0") <= 100) {
            this.setState({ count: value, error: "" });
        }
    };

    handleRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ remark: e.target.value });
    };

    calculateTotal = (): number => {
        const { amount, count, redPacketType } = this.state;
        const { channelType } = this.props;
        const amountNum = parseFloat(amount) || 0;
        const countNum = parseInt(count) || 1;
        
        if (channelType === ChannelTypeGroup && redPacketType === 1) {
            return amountNum * countNum;
        }
        return amountNum;
    };

    handleNext = () => {
        const { amount, count, balance } = this.state;
        const { channelType } = this.props;

        const amountNum = parseFloat(amount);
        const countNum = parseInt(count);
        const totalAmount = this.calculateTotal();

        if (!amount || amountNum <= 0) {
            this.setState({ error: "请输入红包金额" });
            return;
        }

        if (amountNum < 0.01) {
            this.setState({ error: "红包金额不能少于0.01元" });
            return;
        }

        if (channelType === ChannelTypeGroup) {
            if (!count || countNum <= 0) {
                this.setState({ error: "请输入红包个数" });
                return;
            }
            if (countNum > 100) {
                this.setState({ error: "红包个数不能超过100个" });
                return;
            }
        }

        if (totalAmount * 100 > balance) {
            this.setState({ error: "余额不足，请先充值" });
            return;
        }

        this.setState({ step: "password", error: "", payPassword: "" });
    };

    handlePasswordChange = (value: string) => {
        this.setState({ payPassword: value, error: "" });
    };

    handlePasswordComplete = (password: string) => {
        this.handleSend(password);
    };

    handleSend = async (password: string) => {
        const { channelId, channelType, conversationContext, onSendSuccess } = this.props;
        const { amount, count, remark, redPacketType, loading } = this.state;

        if (loading) return;

        this.setState({ loading: true, error: "" });

        try {
            const amountInCents = Math.round(parseFloat(amount) * 100);
            const totalCount = channelType === ChannelTypeGroup ? parseInt(count) : 1;

            const result = await WalletService.shared.sendRedPacket({
                channelId,
                channelType,
                type: redPacketType,
                totalAmount: channelType === ChannelTypeGroup && redPacketType === 1 
                    ? amountInCents * totalCount 
                    : amountInCents,
                totalCount,
                remark: remark || "恭喜发财，大吉大利",
                payPassword: password,
            });

            if (result.packetNo) {
                const content = new RedPacketContent();
                content.packetNo = result.packetNo;
                content.remark = remark || "恭喜发财，大吉大利";
                
                conversationContext.sendMessage(content);
                onSendSuccess(result.packetNo);
            }
        } catch (err: any) {
            // 精确提取后端错误信息
            let errorMsg = "发送失败，请重试";
            
            if (err.msg) {
                // 后端返回格式: { msg: "xxx", status: 400 }
                errorMsg = err.msg;
            } else if (err.message) {
                errorMsg = err.message;
            } else if (typeof err === "string") {
                errorMsg = err;
            }
            
            this.setState({
                error: errorMsg,
                loading: false,
                payPassword: "",
            });
        }
    };

    renderInputStep() {
        const { channelType, onClose } = this.props;
        const { amount, count, remark, redPacketType, error, balance, balanceLoading } = this.state;
        const isGroup = channelType === ChannelTypeGroup;
        const totalAmount = this.calculateTotal();

        return (
            <div className="wk-rp-send">
                {/* Header */}
                <div className="wk-rp-header">
                    <div className="wk-rp-header-bg"></div>
                    <button className="wk-rp-close" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <div className="wk-rp-header-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <rect x="4" y="2" width="16" height="20" rx="2" fill="#FFD700"/>
                            <circle cx="12" cy="10" r="4" fill="#C9302C"/>
                            <rect x="4" y="11" width="16" height="11" rx="0" fill="#C9302C"/>
                            <text x="12" y="18" textAnchor="middle" fontSize="8" fill="#FFD700" fontWeight="bold">¥</text>
                        </svg>
                    </div>
                    <h2 className="wk-rp-title">发红包</h2>
                    <p className="wk-rp-subtitle">
                        {isGroup ? (redPacketType === 2 ? "拼手气红包" : "普通红包") : "个人红包"}
                    </p>
                </div>

                {/* Body */}
                <div className="wk-rp-body">
                    {/* 红包类型选择 - 仅群聊 */}
                    {isGroup && (
                        <div className="wk-rp-type-tabs">
                            <button
                                className={`wk-rp-type-tab ${redPacketType === 2 ? "active" : ""}`}
                                onClick={() => this.setState({ redPacketType: 2 })}
                            >
                                <span className="wk-rp-type-icon">🎲</span>
                                拼手气
                            </button>
                            <button
                                className={`wk-rp-type-tab ${redPacketType === 1 ? "active" : ""}`}
                                onClick={() => this.setState({ redPacketType: 1 })}
                            >
                                <span className="wk-rp-type-icon">💰</span>
                                普通
                            </button>
                        </div>
                    )}

                    {/* 红包个数 - 仅群聊 */}
                    {isGroup && (
                        <div className="wk-rp-field">
                            <label>红包个数</label>
                            <div className="wk-rp-input-wrap">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={count}
                                    onChange={this.handleCountChange}
                                    placeholder="输入个数"
                                />
                                <span className="wk-rp-unit">个</span>
                            </div>
                        </div>
                    )}

                    {/* 金额输入 */}
                    <div className="wk-rp-field">
                        <label>{isGroup && redPacketType === 1 ? "单个金额" : "总金额"}</label>
                        <div className="wk-rp-input-wrap">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onChange={this.handleAmountChange}
                                placeholder="0.00"
                                autoFocus
                            />
                            <span className="wk-rp-unit">元</span>
                        </div>
                    </div>

                    {/* 祝福语 */}
                    <div className="wk-rp-remark">
                        <input
                            type="text"
                            value={remark}
                            onChange={this.handleRemarkChange}
                            placeholder="恭喜发财，大吉大利"
                            maxLength={24}
                        />
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="wk-rp-error">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* 金额显示 */}
                    <div className="wk-rp-total">
                        <span className="wk-rp-total-currency">¥</span>
                        <span className="wk-rp-total-amount">{totalAmount.toFixed(2)}</span>
                    </div>

                    {/* 余额 */}
                    <div className="wk-rp-balance">
                        余额：{balanceLoading ? "加载中..." : `¥${(balance / 100).toFixed(2)}`}
                    </div>

                    {/* 发送按钮 */}
                    <button 
                        className="wk-rp-submit"
                        onClick={this.handleNext}
                        disabled={!amount || parseFloat(amount) <= 0}
                    >
                        塞钱进红包
                    </button>
                </div>
            </div>
        );
    }

    renderPasswordStep() {
        const { onClose } = this.props;
        const { payPassword, error, loading } = this.state;
        const totalAmount = this.calculateTotal();

        return (
            <div className="wk-rp-send wk-rp-password-step">
                {/* Header */}
                <div className="wk-rp-pwd-header">
                    <button className="wk-rp-back" onClick={() => this.setState({ step: "input", payPassword: "", error: "" })}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h3>请输入支付密码</h3>
                    <button className="wk-rp-close-sm" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="wk-rp-pwd-body">
                    <div className="wk-rp-pwd-amount">
                        <span className="wk-rp-pwd-currency">¥</span>
                        <span className="wk-rp-pwd-value">{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="wk-rp-pwd-label">请输入6位数字支付密码</div>

                    <div className="wk-rp-pwd-boxes">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div 
                                key={i} 
                                className={`wk-rp-pwd-box ${payPassword.length > i ? "filled" : ""} ${payPassword.length === i ? "active" : ""}`}
                            >
                                {payPassword.length > i && <span className="wk-rp-pwd-dot"></span>}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="wk-rp-pwd-error">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="wk-rp-pwd-loading">
                            <div className="wk-rp-spinner"></div>
                            <span>发送中...</span>
                        </div>
                    )}

                    <div className="wk-rp-pwd-tip">忘记密码？</div>
                </div>

                {/* 虚拟键盘 */}
                <PayKeyboard
                    value={payPassword}
                    onChange={this.handlePasswordChange}
                    onComplete={this.handlePasswordComplete}
                    maxLength={6}
                    disabled={loading}
                />
            </div>
        );
    }

    render() {
        const { step } = this.state;
        return step === "input" ? this.renderInputStep() : this.renderPasswordStep();
    }
}

import React, { Component } from "react";
import { ConversationContext, WKApp } from "@tsdaodao/base";
import { TransferContent } from "../../Messages/Transfer";
import WalletService from "../../Service";
import PayKeyboard from "../../Components/PayKeyboard";
import "./index.css";

interface TransferSendPageProps {
    toUid: string;
    conversationContext: ConversationContext;
    onClose: () => void;
    onSendSuccess: (transferNo: string) => void;
}

interface TransferSendPageState {
    amount: string;
    remark: string;
    payPassword: string;
    step: "input" | "password";
    loading: boolean;
    error: string;
    balance: number;
    balanceLoading: boolean;
}

export default class TransferSendPage extends Component<TransferSendPageProps, TransferSendPageState> {
    constructor(props: TransferSendPageProps) {
        super(props);
        this.state = {
            amount: "",
            remark: "",
            payPassword: "",
            step: "input",
            loading: false,
            error: "",
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

    handleRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ remark: e.target.value });
    };

    handleNext = () => {
        const { amount, balance } = this.state;
        const amountNum = parseFloat(amount);

        if (!amount || amountNum <= 0) {
            this.setState({ error: "请输入转账金额" });
            return;
        }

        if (amountNum < 0.01) {
            this.setState({ error: "转账金额不能少于0.01元" });
            return;
        }

        if (amountNum * 100 > balance) {
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
        const { toUid, conversationContext, onSendSuccess } = this.props;
        const { amount, remark, loading } = this.state;

        if (loading) return;

        this.setState({ loading: true, error: "" });

        try {
            const amountInCents = Math.round(parseFloat(amount) * 100);

            const result = await WalletService.shared.sendTransfer({
                toUid,
                amount: amountInCents,
                remark: remark || "",
                payPassword: password,
            });

            if (result.transferNo) {
                const content = new TransferContent();
                content.transferNo = result.transferNo;
                content.amount = amountInCents;
                content.remark = remark || "转账";
                
                conversationContext.sendMessage(content);
                onSendSuccess(result.transferNo);
            }
        } catch (err: any) {
            // 精确提取后端错误信息
            let errorMsg = "转账失败，请重试";
            
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
        const { onClose } = this.props;
        const { amount, remark, error, balance, balanceLoading } = this.state;
        const amountNum = parseFloat(amount) || 0;

        return (
            <div className="wk-tf-send">
                {/* Header */}
                <div className="wk-tf-header">
                    <div className="wk-tf-header-bg"></div>
                    <button className="wk-tf-close" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                    <div className="wk-tf-header-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="5" width="20" height="14" rx="2" fill="rgba(255,255,255,0.3)"/>
                            <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">¥</text>
                        </svg>
                    </div>
                    <h2 className="wk-tf-title">转账</h2>
                    <p className="wk-tf-subtitle">转账给好友</p>
                </div>

                {/* Body */}
                <div className="wk-tf-body">
                    {/* 金额输入 */}
                    <div className="wk-tf-amount-section">
                        <span className="wk-tf-currency">¥</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="wk-tf-amount-input"
                            value={amount}
                            onChange={this.handleAmountChange}
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>

                    {/* 余额提示 */}
                    <div className="wk-tf-balance">
                        可用余额：{balanceLoading ? "加载中..." : `¥${(balance / 100).toFixed(2)}`}
                    </div>

                    {/* 转账说明 */}
                    <div className="wk-tf-remark">
                        <input
                            type="text"
                            value={remark}
                            onChange={this.handleRemarkChange}
                            placeholder="添加转账说明（选填）"
                            maxLength={30}
                        />
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="wk-tf-error">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* 提交按钮 */}
                    <button 
                        className="wk-tf-submit"
                        onClick={this.handleNext}
                        disabled={!amount || amountNum <= 0}
                    >
                        转账 {amountNum > 0 ? `¥${amountNum.toFixed(2)}` : ""}
                    </button>
                </div>
            </div>
        );
    }

    renderPasswordStep() {
        const { onClose } = this.props;
        const { payPassword, error, loading, amount } = this.state;
        const amountNum = parseFloat(amount) || 0;

        return (
            <div className="wk-tf-send wk-tf-password-step">
                {/* Header */}
                <div className="wk-tf-pwd-header">
                    <button className="wk-tf-back" onClick={() => this.setState({ step: "input", payPassword: "", error: "" })}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h3>请输入支付密码</h3>
                    <button className="wk-tf-close-btn" onClick={onClose}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="wk-tf-pwd-body">
                    <div className="wk-tf-pwd-amount">
                        <span className="wk-tf-pwd-currency">¥</span>
                        <span className="wk-tf-pwd-value">{amountNum.toFixed(2)}</span>
                    </div>

                    <div className="wk-tf-pwd-label">请输入6位数字支付密码</div>

                    <div className="wk-tf-pwd-boxes">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div 
                                key={i} 
                                className={`wk-tf-pwd-box ${payPassword.length > i ? "filled" : ""} ${payPassword.length === i ? "active" : ""}`}
                            >
                                {payPassword.length > i && <span className="wk-tf-pwd-dot"></span>}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="wk-tf-pwd-error">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7 4V7.5M7 9.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="wk-tf-pwd-loading">
                            <div className="wk-tf-spinner"></div>
                            <span>转账中...</span>
                        </div>
                    )}

                    <div className="wk-tf-pwd-tip">忘记密码？</div>
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

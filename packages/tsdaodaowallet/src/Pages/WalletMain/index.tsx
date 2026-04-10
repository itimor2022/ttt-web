import React, { Component } from "react";
import { WKApp, WKNavMainHeader, WKViewQueueHeader } from "@tsdaodao/base";
import { Button, Input, Toast, Spin } from "@douyinfe/semi-ui";
import WalletService from "../../Service";
import PayKeyboard from "../../Components/PayKeyboard";
import "./index.css";

// 菜单项配置
const menuItems = [
    { key: "main", label: "账户总览", icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    )},
    { key: "recharge", label: "充值", icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )},
    { key: "withdraw", label: "提现", icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )},
    { key: "bills", label: "账单明细", icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    )},
    { key: "password", label: "支付密码", icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
    )},
];

interface WalletPageState {
    selectedKey: string;
}

// 左侧菜单页面
export default class WalletPage extends Component<{}, WalletPageState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selectedKey: "main"
        };
    }

    handleMenuClick = (key: string) => {
        this.setState({ selectedKey: key });
        // 使用 key 强制 React 创建新组件实例
        WKApp.routeRight.replaceToRoot(<WalletContent key={`wallet-${key}`} page={key as PageType} />);
    };

    render() {
        const { selectedKey } = this.state;
        return (
            <div className="wk-wallet-page">
                <WKNavMainHeader title="钱包" />
                <div className="wk-wallet-menu">
                    {menuItems.map(item => (
                        <div
                            key={item.key}
                            className={`wk-wallet-menu-item ${selectedKey === item.key ? "wk-wallet-menu-item-selected" : ""}`}
                            onClick={() => this.handleMenuClick(item.key)}
                        >
                            <div className="wk-wallet-menu-icon">{item.icon}</div>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

// 右侧内容页面
type PageType = "main" | "recharge" | "withdraw" | "withdraw-confirm" | "bills" | "password";

interface WalletContentProps {
    page: PageType;
}

interface WalletContentState {
    balance: number;
    frozen: number;
    hasPayPwd: boolean;
    loading: boolean;
    currentPage: PageType;
    rechargeAmount: string;
    withdrawAmount: string;
    realName: string;
    bankName: string;
    bankCard: string;
    payPassword: string;
    submitting: boolean;
    oldPassword: string;
    password: string;
    confirmPassword: string;
    passwordStep: number;
    bills: any[];
    billsLoading: boolean;
}

export class WalletContent extends Component<WalletContentProps, WalletContentState> {
    constructor(props: WalletContentProps) {
        super(props);
        this.state = {
            balance: 0,
            frozen: 0,
            hasPayPwd: false,
            loading: true,
            currentPage: props.page,
            rechargeAmount: "",
            withdrawAmount: "",
            realName: "",
            bankName: "",
            bankCard: "",
            payPassword: "",
            submitting: false,
            oldPassword: "",
            password: "",
            confirmPassword: "",
            passwordStep: 1,
            bills: [],
            billsLoading: false,
        };
    }

    componentDidMount() {
        this.loadWalletInfo();
        if (this.props.page === "bills") {
            this.loadBills();
        }
    }

    async loadWalletInfo() {
        try {
            const result = await WalletService.shared.getBalance();
            this.setState({
                balance: result.balance,
                frozen: result.frozen,
                hasPayPwd: result.hasPayPwd,
                loading: false,
                passwordStep: result.hasPayPwd ? 1 : 2,
            });
        } catch (err) {
            console.error("加载钱包信息失败", err);
            this.setState({ loading: false });
        }
    }

    async loadBills() {
        this.setState({ billsLoading: true });
        try {
            const result = await WalletService.shared.getBills(1, 50);
            this.setState({ bills: result.list, billsLoading: false });
        } catch (err) {
            console.error("加载账单失败", err);
            this.setState({ billsLoading: false });
        }
    }

    formatAmount = (amount: number): string => {
        return (amount / 100).toFixed(2);
    };

    getTitle(): string {
        const { currentPage, hasPayPwd, passwordStep } = this.state;
        switch (currentPage) {
            case "main": return "账户总览";
            case "recharge": return "充值";
            case "withdraw": return "提现";
            case "withdraw-confirm": return "确认提现";
            case "password":
                if (passwordStep === 1 && hasPayPwd) return "验证原密码";
                if (passwordStep === 2) return hasPayPwd ? "设置新密码" : "设置支付密码";
                return "确认密码";
            case "bills": return "账单明细";
            default: return "钱包";
        }
    }

    handleRecharge = async () => {
        const { rechargeAmount } = this.state;
        const amountNum = parseFloat(rechargeAmount);
        if (!amountNum || amountNum <= 0) {
            Toast.warning("请输入正确的金额");
            return;
        }
        this.setState({ submitting: true });
        try {
            await WalletService.shared.recharge(Math.round(amountNum * 100));
            Toast.success("充值申请已提交");
            this.setState({ rechargeAmount: "" });
            this.loadWalletInfo();
        } catch (err: any) {
            Toast.error(err?.msg || "提交失败");
        } finally {
            this.setState({ submitting: false });
        }
    };

    handleWithdraw = async (pwd: string) => {
        const { withdrawAmount, balance, realName, bankName, bankCard } = this.state;
        const amountNum = parseFloat(withdrawAmount);
        if (amountNum * 100 > balance) {
            Toast.warning("余额不足");
            return;
        }
        this.setState({ submitting: true });
        try {
            await WalletService.shared.withdraw({
                amount: Math.round(amountNum * 100),
                realName, bankName, bankCard, payPassword: pwd,
            });
            Toast.success("提现申请已提交");
            WKApp.routeRight.pop();
        } catch (err: any) {
            Toast.error(err?.msg || "提交失败");
            this.setState({ payPassword: "" });
        } finally {
            this.setState({ submitting: false });
        }
    };

    handleSetPassword = async (inputPwd?: string) => {
        const { password, confirmPassword, oldPassword, passwordStep, hasPayPwd } = this.state;

        if (hasPayPwd && passwordStep === 1) {
            const pwd = inputPwd || oldPassword;
            if (pwd.length !== 6) return;
            this.setState({ submitting: true });
            try {
                const res = await WalletService.shared.verifyPayPassword(pwd);
                if (res.valid) {
                    this.setState({ passwordStep: 2, oldPassword: pwd, password: "", submitting: false });
                } else {
                    Toast.error("原密码错误");
                    this.setState({ oldPassword: "", submitting: false });
                }
            } catch (err: any) {
                Toast.error(err?.msg || "验证失败");
                this.setState({ oldPassword: "", submitting: false });
            }
            return;
        }

        if (passwordStep === 2) {
            const pwd = inputPwd || password;
            if (pwd.length !== 6) return;
            this.setState({ password: pwd, passwordStep: 3, confirmPassword: "" });
            return;
        }

        const confirmPwd = inputPwd || confirmPassword;
        if (confirmPwd !== password) {
            Toast.error("两次密码不一致");
            this.setState({ passwordStep: 2, password: "", confirmPassword: "" });
            return;
        }

        this.setState({ submitting: true });
        try {
            await WalletService.shared.setPayPassword(password, hasPayPwd ? oldPassword : undefined);
            Toast.success("设置成功");
            WKApp.routeRight.pop();
        } catch (err: any) {
            Toast.error(err?.msg || "设置失败");
            this.setState({ passwordStep: hasPayPwd ? 1 : 2, oldPassword: "", password: "", confirmPassword: "" });
        } finally {
            this.setState({ submitting: false });
        }
    };

    renderMain() {
        const { balance, frozen, loading } = this.state;
        return (
            <div className="wk-wallet-balance-card">
                <div className="wk-wallet-balance-label">账户余额(元)</div>
                <div className="wk-wallet-balance-value">
                    {loading ? <Spin size="small" /> : <><span>¥</span>{this.formatAmount(balance)}</>}
                </div>
                {frozen > 0 && <div className="wk-wallet-frozen">冻结 ¥{this.formatAmount(frozen)}</div>}
            </div>
        );
    }

    renderRecharge() {
        const { rechargeAmount, submitting } = this.state;
        return (
            <div className="wk-wallet-form">
                <div className="wk-wallet-form-tip">充值申请提交后，请联系管理员完成转账，审核通过后余额将自动到账。</div>
                <div className="wk-wallet-form-item">
                    <div className="wk-wallet-form-label">充值金额</div>
                    <Input prefix="¥" size="large" type="number" placeholder="请输入充值金额"
                        value={rechargeAmount} onChange={(v) => this.setState({ rechargeAmount: v })} />
                </div>
                <div className="wk-wallet-form-submit">
                    <Button theme="solid" type="primary" loading={submitting} onClick={this.handleRecharge}>提交申请</Button>
                </div>
            </div>
        );
    }

    renderWithdraw() {
        const { withdrawAmount, realName, bankName, bankCard, balance, hasPayPwd } = this.state;
        return (
            <div className="wk-wallet-form">
                <div className="wk-wallet-form-tip">提现申请提交后，管理员将在1-3个工作日内处理。</div>
                <div className="wk-wallet-form-balance">可提现余额：¥{this.formatAmount(balance)}</div>
                <div className="wk-wallet-form-item">
                    <div className="wk-wallet-form-label">提现金额</div>
                    <Input prefix="¥" size="large" type="number" placeholder="请输入提现金额"
                        value={withdrawAmount} onChange={(v) => this.setState({ withdrawAmount: v })} />
                </div>
                <div className="wk-wallet-form-item">
                    <div className="wk-wallet-form-label">真实姓名</div>
                    <Input size="large" placeholder="请输入银行卡持有人姓名"
                        value={realName} onChange={(v) => this.setState({ realName: v })} />
                </div>
                <div className="wk-wallet-form-item">
                    <div className="wk-wallet-form-label">开户银行</div>
                    <Input size="large" placeholder="如：中国工商银行"
                        value={bankName} onChange={(v) => this.setState({ bankName: v })} />
                </div>
                <div className="wk-wallet-form-item">
                    <div className="wk-wallet-form-label">银行卡号</div>
                    <Input size="large" placeholder="请输入银行卡号"
                        value={bankCard} onChange={(v) => this.setState({ bankCard: v })} />
                </div>
                {!hasPayPwd && <div className="wk-wallet-form-warning">请先设置支付密码</div>}
                <div className="wk-wallet-form-submit">
                    <Button theme="solid" type="warning" disabled={!hasPayPwd || !withdrawAmount || !realName || !bankName || !bankCard}
                        onClick={() => this.setState({ currentPage: "withdraw-confirm" })}>下一步</Button>
                </div>
            </div>
        );
    }

    renderWithdrawConfirm() {
        const { withdrawAmount, payPassword, submitting } = this.state;
        return (
            <div className="wk-wallet-pwd-section">
                <div className="wk-wallet-pwd-amount"><span>¥</span>{withdrawAmount}</div>
                <div className="wk-wallet-pwd-tip">请输入支付密码</div>
                <div className="wk-wallet-pwd-dots">
                    {[0,1,2,3,4,5].map(i => (
                        <div key={i} className={`wk-wallet-pwd-dot ${payPassword.length > i ? "filled" : ""}`}>
                            {payPassword.length > i && <span></span>}
                        </div>
                    ))}
                </div>
                {submitting && <Spin style={{ marginTop: 20 }} />}
                <div className="wk-wallet-keyboard">
                    <PayKeyboard value={payPassword} onChange={v => this.setState({ payPassword: v })}
                        onComplete={this.handleWithdraw} disabled={submitting} />
                </div>
            </div>
        );
    }

    renderPassword() {
        const { oldPassword, password, confirmPassword, passwordStep, submitting, hasPayPwd } = this.state;
        let currentPwd = "", tip = "";
        if (passwordStep === 1 && hasPayPwd) { currentPwd = oldPassword; tip = "请输入原支付密码"; }
        else if (passwordStep === 2) { currentPwd = password; tip = "请输入6位数字密码"; }
        else { currentPwd = confirmPassword; tip = "请再次输入密码"; }

        return (
            <div className="wk-wallet-pwd-section">
                <div className="wk-wallet-pwd-tip">{tip}</div>
                <div className="wk-wallet-pwd-dots">
                    {[0,1,2,3,4,5].map(i => (
                        <div key={i} className={`wk-wallet-pwd-dot ${currentPwd.length > i ? "filled" : ""}`}>
                            {currentPwd.length > i && <span></span>}
                        </div>
                    ))}
                </div>
                {submitting && <Spin style={{ marginTop: 20 }} />}
                <div className="wk-wallet-keyboard">
                    <PayKeyboard value={currentPwd} onChange={v => {
                        if (passwordStep === 1 && hasPayPwd) this.setState({ oldPassword: v });
                        else if (passwordStep === 2) this.setState({ password: v });
                        else this.setState({ confirmPassword: v });
                    }} onComplete={this.handleSetPassword} disabled={submitting} />
                </div>
            </div>
        );
    }

    renderBills() {
        const { bills, billsLoading } = this.state;
        return (
            <div className="wk-wallet-bills">
                {billsLoading ? <div className="wk-wallet-bills-loading"><Spin /></div> :
                    bills.length === 0 ? <div className="wk-wallet-bills-empty">暂无记录</div> :
                        bills.map((bill, i) => (
                            <div key={i} className="wk-wallet-bill-item">
                                <div className="wk-wallet-bill-info">
                                    <div className="wk-wallet-bill-type">{bill.type_name || "交易"}</div>
                                    <div className="wk-wallet-bill-time">{bill.created_at}</div>
                                </div>
                                <div className="wk-wallet-bill-right">
                                    <div className={`wk-wallet-bill-amount ${bill.type > 0 && bill.type <= 2 ? "income" : ""}`}>
                                        {bill.type > 0 && bill.type <= 2 ? "+" : "-"}¥{this.formatAmount(bill.amount)}
                                    </div>
                                    {bill.status_name && <div className={`wk-wallet-bill-status status-${bill.status}`}>{bill.status_name}</div>}
                                </div>
                            </div>
                        ))}
            </div>
        );
    }

    render() {
        const { currentPage } = this.state;
        return (
            <div className="wk-wallet-content">
                <WKViewQueueHeader title={this.getTitle()} onBack={() => WKApp.routeRight.pop()} />
                <div className="wk-wallet-content-body">
                    {currentPage === "main" && this.renderMain()}
                    {currentPage === "recharge" && this.renderRecharge()}
                    {currentPage === "withdraw" && this.renderWithdraw()}
                    {currentPage === "withdraw-confirm" && this.renderWithdrawConfirm()}
                    {currentPage === "password" && this.renderPassword()}
                    {currentPage === "bills" && this.renderBills()}
                </div>
            </div>
        );
    }
}

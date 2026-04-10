import { MessageContent, Message } from "wukongimjssdk";
import React, { Component } from "react";
import { WKApp, MessageContentTypeConst } from "@tsdaodao/base";
import "./index.css";

// 转账消息内容（type = 16，与 Android/iOS 一致）
export class TransferContent extends MessageContent {
    transferNo: string = "";    // 转账编号
    amount: number = 0;         // 金额（分）
    remark: string = "";        // 备注
    status: number = 0;         // 状态 0:待领取 1:已领取 2:已退回 3:已过期

    // 必须设置消息类型
    get contentType(): number {
        return MessageContentTypeConst.transfer; // 16
    }

    decodeJSON(content: any) {
        this.transferNo = content["transfer_no"] || "";
        this.amount = content["amount"] || 0;
        this.remark = content["remark"] || "";
        this.status = content["status"] || 0;
    }

    encodeJSON() {
        return {
            transfer_no: this.transferNo,
            amount: this.amount,
            remark: this.remark,
            status: this.status,
        };
    }

    get conversationDigest() {
        return "[转账] " + (this.remark || "转账给你");
    }

    // 金额转换为元
    get amountYuan(): string {
        return (this.amount / 100).toFixed(2);
    }

    // 获取状态文字
    get statusText(): string {
        switch (this.status) {
            case 0: return "待领取";
            case 1: return "已领取";
            case 2: return "已退回";
            case 3: return "已过期";
            default: return "";
        }
    }
}

// 转账消息 Cell 组件
interface TransferCellProps {
    message: Message;
    context: any;
}

interface TransferCellState {
    showDetail: boolean;
}

export class TransferCell extends Component<TransferCellProps, TransferCellState> {
    constructor(props: TransferCellProps) {
        super(props);
        this.state = {
            showDetail: false,
        };
    }

    handleClick = () => {
        const content = this.props.message.content as TransferContent;
        // 打开转账详情
        WKApp.shared.openTransferDetail?.(content.transferNo);
    };

    render() {
        const { message } = this.props;
        const content = message.content as TransferContent;
        const isSelf = message.fromUID === WKApp.loginInfo.uid;
        const isPending = content.status === 0;

        return (
            <div
                className={`wk-transfer-cell ${isSelf ? "self" : "other"} ${isPending ? "" : "received"}`}
                onClick={this.handleClick}
            >
                <div className="wk-transfer-content">
                    <div className="wk-transfer-icon">
                        <span className="wk-transfer-icon-text">💰</span>
                    </div>
                    <div className="wk-transfer-info">
                        <div className="wk-transfer-amount">¥{content.amountYuan}</div>
                        <div className="wk-transfer-remark">
                            {content.remark || "转账给你"}
                        </div>
                    </div>
                </div>
                <div className="wk-transfer-footer">
                    <span className="wk-transfer-status">{content.statusText}</span>
                </div>
            </div>
        );
    }
}


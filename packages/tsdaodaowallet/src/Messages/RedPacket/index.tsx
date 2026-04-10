import { MessageContent, Message } from "wukongimjssdk";
import React, { Component } from "react";
import { WKApp, MessageContentTypeConst } from "@tsdaodao/base";
import "./index.css";

// 红包消息内容（type = 15，与 Android/iOS 一致）
export class RedPacketContent extends MessageContent {
    packetNo: string = "";      // 红包编号
    amount: number = 0;         // 金额（分）
    remark: string = "";        // 祝福语
    status: number = 0;         // 状态 0:未领取 1:已领取 2:已抢完 3:已过期

    // 必须设置消息类型
    get contentType(): number {
        return MessageContentTypeConst.redpacket; // 15
    }

    decodeJSON(content: any) {
        this.packetNo = content["packet_no"] || "";
        this.amount = content["amount"] || 0;
        this.remark = content["remark"] || "恭喜发财，大吉大利";
        this.status = content["status"] || 0;
    }

    encodeJSON() {
        return {
            packet_no: this.packetNo,
            amount: this.amount,
            remark: this.remark,
            status: this.status,
        };
    }

    get conversationDigest() {
        return "[红包] " + this.remark;
    }

    // 金额转换为元
    get amountYuan(): string {
        return (this.amount / 100).toFixed(2);
    }
}

// 红包消息 Cell 组件
interface RedPacketCellProps {
    message: Message;
    context: any;
}

interface RedPacketCellState {
    showDetail: boolean;
}

export class RedPacketCell extends Component<RedPacketCellProps, RedPacketCellState> {
    constructor(props: RedPacketCellProps) {
        super(props);
        this.state = {
            showDetail: false,
        };
    }

    handleClick = () => {
        const content = this.props.message.content as RedPacketContent;
        // 打开红包详情
        WKApp.shared.openRedPacketDetail?.(content.packetNo);
    };

    render() {
        const { message } = this.props;
        const content = message.content as RedPacketContent;
        const isSelf = message.fromUID === WKApp.loginInfo.uid;
        const isGrabbed = content.status > 0;

        return (
            <div
                className={`wk-redpacket-cell ${isSelf ? "self" : "other"} ${isGrabbed ? "grabbed" : ""}`}
                onClick={this.handleClick}
            >
                <div className="wk-redpacket-content">
                    <div className="wk-redpacket-icon">
                        <span className="wk-redpacket-icon-text">🧧</span>
                    </div>
                    <div className="wk-redpacket-info">
                        <div className="wk-redpacket-remark">{content.remark || "恭喜发财，大吉大利"}</div>
                        <div className="wk-redpacket-tip">
                            {isGrabbed ? "已领取" : "领取红包"}
                        </div>
                    </div>
                </div>
                <div className="wk-redpacket-footer">
                    <span className="wk-redpacket-label">红包</span>
                </div>
            </div>
        );
    }
}


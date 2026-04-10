import React, { Component, ReactNode } from "react";
import { ConversationContext, WKApp } from "@tsdaodao/base";
import RedPacketSendPage from "../../Pages/RedPacketSend";
import "./index.css";

interface RedPacketToolbarProps {
    conversationContext: ConversationContext;
}

interface RedPacketToolbarState {}

export default class RedPacketToolbar extends Component<RedPacketToolbarProps, RedPacketToolbarState> {
    constructor(props: RedPacketToolbarProps) {
        super(props);
        this.state = {};
    }

    handleClick = () => {
        const { conversationContext } = this.props;
        const channel = conversationContext.channel();

        const onClose = () => {
            WKApp.shared.baseContext?.hideGlobalModal?.();
        };

        const onSendSuccess = (packetNo: string) => {
            console.log("红包发送成功:", packetNo);
            onClose();
        };

        WKApp.shared.baseContext?.showGlobalModal?.({
            body: (
                <RedPacketSendPage
                    channelId={channel.channelID}
                    channelType={channel.channelType}
                    conversationContext={conversationContext}
                    onClose={onClose}
                    onSendSuccess={onSendSuccess}
                />
            ),
            footer: null,
            closable: false,
            className: "wk-wallet-send-modal",
            width: "420px",
            onCancel: onClose,
        });
    };

    render(): ReactNode {
        return (
            <div className="wk-wallet-toolbar-btn wk-redpacket-btn" onClick={this.handleClick} title="发红包">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="2" width="16" height="20" rx="2" fill="#E74C3C"/>
                    <rect x="4" y="2" width="16" height="8" rx="2" fill="#C0392B"/>
                    <circle cx="12" cy="10" r="4" fill="#FFD700" stroke="#E74C3C" strokeWidth="1"/>
                    <text x="12" y="12.5" textAnchor="middle" fontSize="6" fill="#E74C3C" fontWeight="bold">¥</text>
                </svg>
            </div>
        );
    }
}

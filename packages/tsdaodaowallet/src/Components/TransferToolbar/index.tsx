import React, { Component, ReactNode } from "react";
import { ConversationContext, WKApp } from "@tsdaodao/base";
import { ChannelTypePerson } from "wukongimjssdk";
import TransferSendPage from "../../Pages/TransferSend";
import "./index.css";

interface TransferToolbarProps {
    conversationContext: ConversationContext;
}

interface TransferToolbarState {}

export default class TransferToolbar extends Component<TransferToolbarProps, TransferToolbarState> {
    constructor(props: TransferToolbarProps) {
        super(props);
        this.state = {};
    }

    handleClick = () => {
        const { conversationContext } = this.props;
        const channel = conversationContext.channel();

        if (channel.channelType !== ChannelTypePerson) {
            return;
        }

        const onClose = () => {
            WKApp.shared.baseContext?.hideGlobalModal?.();
        };

        const onSendSuccess = (transferNo: string) => {
            console.log("转账发送成功:", transferNo);
            onClose();
        };

        WKApp.shared.baseContext?.showGlobalModal?.({
            body: (
                <TransferSendPage
                    toUid={channel.channelID}
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
        const { conversationContext } = this.props;
        const channel = conversationContext.channel();

        if (channel.channelType !== ChannelTypePerson) {
            return null;
        }

        return (
            <div className="wk-wallet-toolbar-btn wk-transfer-btn" onClick={this.handleClick} title="转账">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="5" width="20" height="14" rx="2" fill="#FFA940"/>
                    <rect x="2" y="5" width="20" height="5" fill="#FA8C16" rx="2"/>
                    <circle cx="12" cy="13" r="3" fill="#FFE58F"/>
                    <text x="12" y="15" textAnchor="middle" fontSize="5" fill="#FA8C16" fontWeight="bold">¥</text>
                </svg>
            </div>
        );
    }
}

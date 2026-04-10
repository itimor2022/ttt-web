import { IModule, WKApp, MessageContentTypeConst, Menus } from "@tsdaodao/base";
import { WKSDK, ChannelTypePerson } from "wukongimjssdk";
import React, { ElementType } from "react";
import { RedPacketContent, RedPacketCell } from "./Messages/RedPacket";
import { TransferContent, TransferCell } from "./Messages/Transfer";
import RedPacketOpenPage from "./Pages/RedPacketOpen";
import RedPacketDetailPage from "./Pages/RedPacketDetail";
import TransferDetailPage from "./Pages/TransferDetail";
import RedPacketToolbar from "./Components/RedPacketToolbar";
import TransferToolbar from "./Components/TransferToolbar";
import WalletPage, { WalletContent } from "./Pages/WalletMain";
import "./styles.css";

// 消息类型常量（与 Android/iOS 保持一致）
export const MessageContentTypeRedPacket = MessageContentTypeConst.redpacket; // 15
export const MessageContentTypeTransfer = MessageContentTypeConst.transfer;   // 16
export const MessageContentTypeRedPacketReceived = 1010;
export const MessageContentTypeTransferStatusChanged = 1011;

export default class WalletModule implements IModule {
    id(): string {
        return "WalletModule";
    }

    init(): void {
        console.log("【WalletModule】初始化");

        // 注册红包消息
        WKSDK.shared().register(MessageContentTypeRedPacket, () => new RedPacketContent());
        WKApp.messageManager.registerCell(MessageContentTypeRedPacket, (): ElementType => {
            return RedPacketCell;
        });

        // 注册转账消息
        WKSDK.shared().register(MessageContentTypeTransfer, () => new TransferContent());
        WKApp.messageManager.registerCell(MessageContentTypeTransfer, (): ElementType => {
            return TransferCell;
        });

        // 注册聊天工具栏 - 发红包
        WKApp.endpoints.registerChatToolbar("chattoolbar.redpacket", (ctx) => {
            return <RedPacketToolbar conversationContext={ctx} />;
        });

        // 注册聊天工具栏 - 转账（仅个人聊天）
        WKApp.endpoints.registerChatToolbar("chattoolbar.transfer", (ctx) => {
            const channel = ctx.channel();
            if (channel.channelType !== ChannelTypePerson) {
                return undefined;
            }
            return <TransferToolbar conversationContext={ctx} />;
        });

        // 扩展 WKApp.shared 添加打开红包/转账详情的方法
        (WKApp.shared as any).openRedPacketDetail = this.openRedPacketDetail.bind(this);
        (WKApp.shared as any).openTransferDetail = this.openTransferDetail.bind(this);

        // 注册钱包菜单（和收藏模块一致的注册方式）
        WKApp.menus.register("wallet", () => {
            const m = new Menus(
                "wallet",
                "/wallet",
                "钱包",
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8c8c8c" strokeWidth="1.5"/>
                    <path d="M2 9H22" stroke="#8c8c8c" strokeWidth="1.5"/>
                    <circle cx="17" cy="14" r="1.5" fill="#8c8c8c"/>
                </svg>,
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#E46342" strokeWidth="1.5"/>
                    <path d="M2 9H22" stroke="#E46342" strokeWidth="1.5"/>
                    <circle cx="17" cy="14" r="1.5" fill="#E46342"/>
                </svg>,
                () => {
                    WKApp.routeRight.replaceToRoot(<WalletContent key="wallet-main" page="main" />);
                }
            );
            return m;
        }, 2500);

        // 注册钱包路由（左侧面板）
        WKApp.route.register("/wallet", () => {
            return <WalletPage />;
        });

        console.log("【WalletModule】红包(type=15)和转账(type=16)消息已注册");
        console.log("【WalletModule】聊天工具栏已注册（红包/转账按钮）");
        console.log("【WalletModule】钱包菜单已注册");
    }

    // 打开红包（开红包弹窗）
    openRedPacketDetail(packetNo: string): void {
        const onClose = () => {
            WKApp.shared.baseContext?.hideGlobalModal?.();
        };

        const onViewDetail = () => {
            onClose();
            setTimeout(() => {
                this.showRedPacketDetailPage(packetNo);
            }, 100);
        };

        WKApp.shared.baseContext?.showGlobalModal?.({
            body: (
                <RedPacketOpenPage
                    packetNo={packetNo}
                    onClose={onClose}
                    onViewDetail={onViewDetail}
                />
            ),
            footer: null,
            closable: false,
            className: "wk-wallet-modal-overlay",
            width: "100%",
            onCancel: onClose,
        });
    }

    // 显示红包详情页
    showRedPacketDetailPage(packetNo: string): void {
        const onClose = () => {
            WKApp.shared.baseContext?.hideGlobalModal?.();
        };

        WKApp.shared.baseContext?.showGlobalModal?.({
            body: (
                <RedPacketDetailPage
                    packetNo={packetNo}
                    onClose={onClose}
                />
            ),
            footer: null,
            closable: false,
            className: "wk-wallet-detail-modal",
            width: "450px",
            onCancel: onClose,
        });
    }

    // 打开转账详情
    openTransferDetail(transferNo: string): void {
        const onClose = () => {
            WKApp.shared.baseContext?.hideGlobalModal?.();
        };

        WKApp.shared.baseContext?.showGlobalModal?.({
            body: (
                <TransferDetailPage
                    transferNo={transferNo}
                    onClose={onClose}
                />
            ),
            footer: null,
            closable: false,
            className: "wk-wallet-detail-modal",
            width: "450px",
            onCancel: onClose,
        });
    }
}

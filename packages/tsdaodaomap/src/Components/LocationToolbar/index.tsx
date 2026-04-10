import React, { Component, ReactNode } from "react";
import { WKApp } from "@tsdaodao/base";
import { LocationData } from "../../module";
import "./index.css";

// LocationContent 类定义（与 tsdaodaobase 中的 LocationContent 一致）
class LocationContent {
    lng: number = 0;
    lat: number = 0;
    title: string = "";
    address: string = "";
    img: string = "";

    encodeJSON() {
        return {
            type: 6, // location message type
            lng: this.lng,
            lat: this.lat,
            title: this.title,
            address: this.address,
            img: this.img,
        };
    }
}

// 会话上下文接口
interface ConversationContext {
    channel(): { channelID: string; channelType: number };
    sendMessage(content: any): void;
}

interface LocationToolbarProps {
    icon: string;
    conversationContext: ConversationContext;
}

interface LocationToolbarState {
    showPicker: boolean;
}

export default class LocationToolbar extends Component<LocationToolbarProps, LocationToolbarState> {
    constructor(props: LocationToolbarProps) {
        super(props);
        this.state = {
            showPicker: false,
        };
    }

    handleClick = () => {
        const mapModule = (WKApp.shared as any).mapModule;
        if (!mapModule) {
            console.error("MapModule not initialized");
            return;
        }

        mapModule.openLocationPicker((location: LocationData) => {
            this.sendLocation(location);
        });
    };

    sendLocation = (location: LocationData) => {
        const { conversationContext } = this.props;
        
        // 创建位置消息内容
        const content = new LocationContent();
        content.lng = location.lng;
        content.lat = location.lat;
        content.title = location.title;
        content.address = location.address;
        content.img = location.img || "";

        // 发送消息
        conversationContext.sendMessage(content);
    };

    render(): ReactNode {
        const { icon } = this.props;

        return (
            <div className="wk-location-toolbar" onClick={this.handleClick}>
                <div className="wk-location-toolbar-icon">
                    <img src={icon} alt="位置" />
                </div>
            </div>
        );
    }
}


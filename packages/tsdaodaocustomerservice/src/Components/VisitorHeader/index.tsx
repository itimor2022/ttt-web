import React from "react";
import { Component } from "react";
import moment from 'moment'
import "./index.css"

export interface VisitorHeaderProps {
    avatar: string
    name: string
    position:string
    online:boolean
    lastOffline:number
}

export default class VisitorHeader extends Component<VisitorHeaderProps>{


    render() {
        const { avatar, name,position,online,lastOffline } = this.props

        return <div className="wk-visitorheader">
            <div className="wk-visitorheader-content">
                <div className="wk-visitorheader-content-avatar">
                    <img src={avatar} alt="" />
                </div>
                <div className="wk-visitorheader-content-info">
                    <div className="wk-visitorheader-content-name">
                        {name}
                    </div>
                    <div className="wk-visitorheader-content-props">
                        <div className="wk-visitorheader-content-prop">
                            位置：{position}
                        </div>
                        <div className="wk-visitorheader-content-prop">
                            {
                                online?"在线状态：在线":`最后在线：${moment(lastOffline * 1000).format('YYYY-MM-DD HH:mm')}`
                            }
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
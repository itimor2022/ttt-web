
import { ChannelSettingRouteData, ChannelTypeCustomerService, WKApp, ListItem, Row, Section } from '@tsdaodao/base'
import { IModule } from '@tsdaodao/base'
import VisitorHeader from './Components/VisitorHeader'
export default class CustomerserviceModule implements IModule {

    id(): string {
        return "CustomerserviceModule"
    }
    init(): void {
        console.log("【CustomerserviceModule】初始化")

        WKApp.shared.channelSettingRegister("channel.setting.customerservice.header", (context) => {
            const data = context.routeData() as ChannelSettingRouteData
            const channelInfo = data.channelInfo
            if (data.channel.channelType !== ChannelTypeCustomerService) {
                return undefined
            }
            const position = channelInfo?.orgData.address
            const online = channelInfo?.online
            const lastOffline = channelInfo?.lastOffline

            return new Section({
                rows: [
                    new Row({
                        cell: VisitorHeader,
                        properties: {
                            name: channelInfo?.orgData.displayName,
                            position: position,
                            online: online,
                            lastOffline: lastOffline,
                            avatar: WKApp.dataSource.commonDataSource.getImageURL(channelInfo?.logo!),
                            onClick: () => {

                            }
                        },
                    }),
                ],
            })
        })

        WKApp.shared.channelSettingRegister("channel.setting.customerservice.base", (context) => {
            const data = context.routeData() as ChannelSettingRouteData
            const channelInfo = data.channelInfo
            if (data.channel.channelType !== ChannelTypeCustomerService) {
                return undefined
            }

            const phone = channelInfo?.orgData.phone
            const email = channelInfo?.orgData.email

            return new Section({
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "名字",
                            subTitle: channelInfo?.title,
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "邮箱",
                            subTitle: email && email!==""?email:"未填写",
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "电话",
                            subTitle: phone && phone!==""?phone:"未填写",
                            onClick: () => {

                            }
                        },
                    }),
                ]
            })
        })

        WKApp.shared.channelSettingRegister("channel.setting.customerservice.userprops", (context) => {
            const data = context.routeData() as ChannelSettingRouteData
            const channelInfo = data.channelInfo
            if (data.channel.channelType !== ChannelTypeCustomerService) {
                return undefined
            }
           const ipAddress = channelInfo?.orgData.ip_address
           const address = channelInfo?.orgData.address
           const createdAt = channelInfo?.orgData.created_at
          
            return new Section({
                title: "用户属性",
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "IP",
                            subTitle: `${ipAddress}（${address}）`,
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "来源",
                            subTitle: "科秀",
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "注册时间",
                            subTitle: createdAt,
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "对话发起于",
                            subTitle: "科秀",
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "上条消息发送于",
                            subTitle: "科秀",
                            onClick: () => {

                            }
                        },
                    }),
                ]
            })
        })

        WKApp.shared.channelSettingRegister("channel.setting.customerservice.deviceprops", (context) => {
            const data = context.routeData() as ChannelSettingRouteData
            const channelInfo = data.channelInfo
            if (data.channel.channelType !== ChannelTypeCustomerService) {
                return undefined
            }
            const device = channelInfo?.orgData.device?.device
            const model = channelInfo?.orgData.device?.model || ""
            const os = channelInfo?.orgData.device?.os || ""
            const version = channelInfo?.orgData.device?.version || ""
            return new Section({
                title: "设备属性",
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "设备",
                            subTitle: `${device} ${model}`,
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "系统",
                            subTitle: `${os} ${version}`,
                            onClick: () => {

                            }
                        },
                    }),
                ]
            })
        })

        WKApp.shared.channelSettingRegister("channel.setting.customerservice.customerprops", (context) => {
            const data = context.routeData() as ChannelSettingRouteData
            const channelInfo = data.channelInfo
            if (data.channel.channelType !== ChannelTypeCustomerService) {
                return undefined
            }
            return new Section({
                title: "自定义属性",
                rows: [
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "微信号",
                            subTitle: "xxxx",
                            onClick: () => {

                            }
                        },
                    }),
                    new Row({
                        cell: ListItem,
                        properties: {
                            title: "QQ号",
                            subTitle: "1233348",
                            onClick: () => {

                            }
                        },
                    }),
                ]
            })
        })
    }
}
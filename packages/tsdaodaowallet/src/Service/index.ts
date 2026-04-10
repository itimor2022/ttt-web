import { WKApp } from "@tsdaodao/base";

export interface SendRedPacketParams {
    channelId: string;
    channelType: number;
    type: number;
    totalAmount: number;
    totalCount: number;
    remark: string;
    payPassword: string;
}

export interface SendTransferParams {
    toUid: string;
    amount: number;
    remark: string;
    payPassword: string;
}

export interface RedPacketDetail {
    packetNo: string;
    senderUid: string;
    senderName: string;
    senderAvatar: string;
    totalAmount: number;
    totalCount: number;
    grabbedAmount: number;
    grabbedCount: number;
    remark: string;
    status: number;
    type: number;
    createdAt: string;
    isGrabbed: boolean;
    myGrabbedAmount: number;
    records: RedPacketRecord[];
}

export interface RedPacketRecord {
    uid: string;
    name: string;
    avatar: string;
    amount: number;
    grabbedAt: string;
    isBest: boolean;
}

export interface TransferDetail {
    transferNo: string;
    fromUid: string;
    fromName: string;
    fromAvatar: string;
    toUid: string;
    toName: string;
    toAvatar: string;
    amount: number;
    remark: string;
    status: number;
    createdAt: string;
    receivedAt: string;
}

export interface BillItem {
    id: number;
    bill_no: string;
    bill_type: string;     // record/recharge/withdraw
    type: number;          // 类型代码
    type_name: string;     // 类型名称
    amount: number;
    status: number;        // 0-待处理 1-成功 2-已通过 3-已拒绝
    status_name: string;   // 状态名称
    remark: string;
    created_at: string;
}

export interface WalletInfo {
    balance: number;
    frozen: number;
    hasPayPwd: boolean;
}

class WalletService {
    private static _instance: WalletService;

    static get shared(): WalletService {
        if (!WalletService._instance) {
            WalletService._instance = new WalletService();
        }
        return WalletService._instance;
    }

    // 发送红包
    async sendRedPacket(params: SendRedPacketParams): Promise<{ packetNo: string }> {
        const resp = await WKApp.apiClient.post("wallet/redpacket/send", {
            channel_id: params.channelId,
            channel_type: params.channelType,
            type: params.type,
            total_amount: params.totalAmount,
            total_count: params.totalCount,
            remark: params.remark,
            pay_password: params.payPassword,
        });
        return { packetNo: resp.packet_no };
    }

    // 抢红包
    async grabRedPacket(packetNo: string): Promise<{ amount: number }> {
        const resp = await WKApp.apiClient.post(`wallet/redpacket/${packetNo}/grab`, {});
        return { amount: resp.amount || 0 };
    }

    // 获取红包详情
    async getRedPacketDetail(packetNo: string): Promise<RedPacketDetail> {
        const resp = await WKApp.apiClient.get(`wallet/redpacket/${packetNo}`);
        return {
            packetNo: resp.packet_no,
            senderUid: resp.sender_uid,
            senderName: resp.sender_name,
            senderAvatar: resp.sender_avatar,
            totalAmount: resp.total_amount,
            totalCount: resp.total_count,
            grabbedAmount: resp.grabbed_amount || 0,
            grabbedCount: resp.grabbed_count || 0,
            remark: resp.remark || "恭喜发财，大吉大利",
            status: resp.status,
            type: resp.type,
            createdAt: resp.created_at,
            isGrabbed: resp.is_grabbed || false,
            myGrabbedAmount: resp.my_grabbed_amount || 0,
            records: (resp.records || []).map((r: any) => ({
                uid: r.uid,
                name: r.name,
                avatar: r.avatar,
                amount: r.amount,
                grabbedAt: r.grabbed_at,
                isBest: r.is_best || false,
            })),
        };
    }

    // 发送转账
    async sendTransfer(params: SendTransferParams): Promise<{ transferNo: string }> {
        const resp = await WKApp.apiClient.post("wallet/transfer/send", {
            to_uid: params.toUid,
            amount: params.amount,
            remark: params.remark,
            pay_password: params.payPassword,
        });
        return { transferNo: resp.transfer_no };
    }

    // 领取转账
    async receiveTransfer(transferNo: string): Promise<void> {
        await WKApp.apiClient.post(`wallet/transfer/${transferNo}/receive`, {});
    }

    // 获取转账详情
    async getTransferDetail(transferNo: string): Promise<TransferDetail> {
        const resp = await WKApp.apiClient.get(`wallet/transfer/${transferNo}`);
        return {
            transferNo: resp.transfer_no,
            fromUid: resp.from_uid,
            fromName: resp.from_name,
            fromAvatar: resp.from_avatar,
            toUid: resp.to_uid,
            toName: resp.to_name,
            toAvatar: resp.to_avatar,
            amount: resp.amount,
            remark: resp.remark,
            status: resp.status,
            createdAt: resp.created_at,
            receivedAt: resp.received_at,
        };
    }

    // 获取钱包余额
    async getBalance(): Promise<WalletInfo> {
        const resp = await WKApp.apiClient.get("wallet/balance");
        return {
            balance: resp.balance || 0,
            frozen: resp.frozen || 0,
            hasPayPwd: resp.has_pay_pwd || false,
        };
    }

    // 验证支付密码
    async verifyPayPassword(password: string): Promise<{ valid: boolean }> {
        try {
            await WKApp.apiClient.post("wallet/verify_pay_password", {
                password,
            });
            return { valid: true };
        } catch {
            return { valid: false };
        }
    }

    // 设置支付密码
    async setPayPassword(password: string, oldPassword?: string): Promise<void> {
        await WKApp.apiClient.post("wallet/pay_password", {
            password,
            old_password: oldPassword,
        });
    }

    // 申请充值
    async recharge(amount: number): Promise<void> {
        await WKApp.apiClient.post("wallet/recharge", {
            amount,
        });
    }

    // 申请提现
    async withdraw(params: {
        amount: number;
        realName: string;
        bankName: string;
        bankCard: string;
        payPassword: string;
        remark?: string;
    }): Promise<void> {
        await WKApp.apiClient.post("wallet/withdraw", {
            amount: params.amount,
            real_name: params.realName,
            bank_name: params.bankName,
            bank_card: params.bankCard,
            pay_password: params.payPassword,
            remark: params.remark || "",
        });
    }

    // 获取账单列表
    async getBills(
        page: number = 1,
        pageSize: number = 20
    ): Promise<{ list: BillItem[]; total: number }> {
        const resp = await WKApp.apiClient.get("wallet/bills", { 
            param: { page, page_size: pageSize } 
        });
        
        // 后端直接返回数组
        const data = Array.isArray(resp) ? resp : (resp.list || []);
        
        const list: BillItem[] = data.map((item: any) => ({
            id: item.id,
            bill_no: item.bill_no || "",
            bill_type: item.bill_type || "record",
            type: item.type || 0,
            type_name: item.type_name || "交易",
            amount: item.amount || 0,
            status: item.status || 0,
            status_name: item.status_name || "",
            remark: item.remark || "",
            created_at: item.created_at || "",
        }));
        
        return {
            list,
            total: resp.total || list.length,
        };
    }
}

export default WalletService;

import React from "react";
import { Component, ReactNode } from "react";
import { Divider, Col, Row, Button } from "@douyinfe/semi-ui";
import { Channel, ChannelTypePerson } from "wukongimjssdk";

import { WKApp, WKViewQueueHeader } from "@tsdaodao/base";
import WKAvatar from "@tsdaodao/base/src/Components/WKAvatar";
import { RTCCall, WKRTCCallType } from "@tsdaodao/rtc";

import "./index.css";

interface IPorpsEmployeeDetails {
  orgId: string;
  employeeUid: string;
}

interface ISEmployeeDetails {
  employeeInfo: {
    employee_id?: string;
    uid?: string;
    employee_name?: string;
    job_title?: string;
    joined_dept_paths?: string[];
    org_id?: string;
    role?: number;
    username?: string;
    workforce_type?: string;
    phone?: string;
    idcard?: string;
    email?: string;
    remark?: string;
  };
}

export class EmployeeDetails extends Component<
  IPorpsEmployeeDetails,
  ISEmployeeDetails
> {
  state: ISEmployeeDetails = {
    employeeInfo: {},
  };
  constructor(props: any) {
    super(props);
  }

  setStateAsync(state: ISEmployeeDetails) {
    return new Promise((resolve: any) => {
      this.setState(state, resolve);
    });
  }
  componentDidMount(): void {
    this.getEmployeeDetails(this.props.orgId, this.props.employeeUid);
  }

  componentDidUpdate(
    prevProps: Readonly<IPorpsEmployeeDetails>,
    prevState: ISEmployeeDetails,
    snapshot?: any
  ): void {
    if (this.props.employeeUid !== prevProps.employeeUid) {
      this.getEmployeeDetails(this.props.orgId, this.props.employeeUid);
    }
  }

  async getEmployeeDetails(org_id: string, employee_uid: string) {
    const res = await WKApp.apiClient.get(
      `/organizations/${org_id}/employee/${employee_uid}`
    );
    this.setState({
      employeeInfo: res,
    });
  }
  /**
   * 发送消息
   * @param uuid
   * @param type
   */
  onSendMessage(uuid: string, type: number) {
    const channel = new Channel(uuid, type);
    WKApp.endpoints.showConversation(channel);
  }
  /**
   * 语音/视频
   * @param uuid
   * @param callType
   */
  onCall(uuid: string, callType: WKRTCCallType) {
    this.onSendMessage(uuid, ChannelTypePerson);
    RTCCall(uuid, callType);
  }

  render(): ReactNode {
    const { employeeInfo } = this.state;
    return (
      <div className="wk-employee-detailes">
        <div className="wk-employee-detailes-content">
          <div className="warp-info">
            <div className="warp-info-user-base">
              <div className="user-name">{employeeInfo.employee_name}</div>
              <div>
                {employeeInfo?.uid && (
                  <WKAvatar
                    src={WKApp.shared.avatarUser(employeeInfo?.uid as string)}
                    style={{ width: "40px", height: "40px" }}
                  />
                )}
              </div>
            </div>
            <Divider margin="20px" />
            <div className="warp-info-user-other">
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">手机号</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">{employeeInfo?.phone}</div>
                </Col>
              </Row>
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">工号</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">{employeeInfo?.idcard}</div>
                </Col>
              </Row>
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">邮箱</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">{employeeInfo?.email}</div>
                </Col>
              </Row>
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">职位</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">{employeeInfo?.job_title}</div>
                </Col>
              </Row>
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">部门</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">
                    {employeeInfo?.joined_dept_paths &&
                      employeeInfo?.joined_dept_paths[0]}
                  </div>
                </Col>
              </Row>
              <Row className="item-other">
                <Col span={6}>
                  <div className="col-content">备注</div>
                </Col>
                <Col span={18}>
                  <div className="col-content">
                    {employeeInfo?.remark && employeeInfo?.remark}
                  </div>
                </Col>
              </Row>
            </div>
            <div className="warp-info-user-opt">
              <Row gutter={16}>
                <Col
                  span={
                    employeeInfo?.uid && employeeInfo?.uid !== localStorage.uid
                      ? 8
                      : 24
                  }
                >
                  <Button
                    type="primary"
                    theme="solid"
                    className="wk-but-message"
                    block
                    onClick={() => {
                      this.onSendMessage(
                        employeeInfo?.uid as string,
                        ChannelTypePerson
                      );
                    }}
                  >
                    发送消息
                  </Button>
                </Col>
                {employeeInfo?.uid && employeeInfo?.uid !== localStorage.uid && (
                  <>
                    <Col span={8}>
                      <Button
                        block
                        onClick={() => {
                          this.onCall(
                            employeeInfo?.uid as string,
                            WKRTCCallType.Audio
                          );
                        }}
                      >
                        语音通话
                      </Button>
                    </Col>
                    <Col span={8}>
                      <Button
                        block
                        onClick={() => {
                          this.onCall(
                            employeeInfo?.uid as string,
                            WKRTCCallType.Video
                          );
                        }}
                      >
                        视频通话
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

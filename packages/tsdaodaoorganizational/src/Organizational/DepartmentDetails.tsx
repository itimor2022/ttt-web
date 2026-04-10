import React from "react";
import { Component, ReactNode } from "react";
import { Divider, Col, Row, Button } from "@douyinfe/semi-ui";
import { WKApp, WKViewQueueHeader } from "@tsdaodao/base";
import WKAvatar from "@tsdaodao/base/src/Components/WKAvatar";

import "./index.css";

interface IPorpsDepartmentDetails {
  orgId: string;
  deptId: string;
  companyName: string;
}

interface ISateDepartmentDetails {
  departmentInfo: {
    name?: string;
    org_id?: string;
    dept_id?: string;
    employees?: any[];
  };
  employeesNum: number;
}

export class DepartmentDetails extends Component<
  IPorpsDepartmentDetails,
  ISateDepartmentDetails
> {
  state: ISateDepartmentDetails = {
    departmentInfo: {},
    employeesNum: 0,
  };

  constructor(props: any) {
    super(props);
  }

  componentDidMount(): void {
    this.getEmployeeDetails(this.props.orgId, this.props.deptId);
  }

  componentDidUpdate(
    prevProps: Readonly<IPorpsDepartmentDetails>,
    prevState: Readonly<ISateDepartmentDetails>,
    snapshot?: any
  ): void {
    if (this.props.deptId !== prevProps.deptId) {
      this.getEmployeeDetails(this.props.orgId, this.props.deptId);
    }
  }

  // 处理全部子部门人数
  handelEmployeesNum(arr: any[]) {
    let employeesNums: number[] = [];
    arr.map((item) => {
      if (item.employee_count) {
        employeesNums.push(item.employee_count);
      }
      if (item.children && item.children.length > 0) {
        const employeesNum = this.handelEmployeesNum(item.children);
        employeesNums = [...employeesNums, ...employeesNum];
      }
    });
    return employeesNums;
  }

  async getEmployeeDetails(org_id: string, dept_id: string) {
    const res = await WKApp.apiClient.get(
      `/organizations/${org_id}/department/${dept_id}`
    );
    let employeesNum = 0;
    // 获取当前部门人数
    if (res.employees) {
      employeesNum = res.employees.length;
    }
    // 获取全部子部门人数
    if (res.children) {
      const employeesNums = this.handelEmployeesNum(res.children);
      employeesNums.map((num) => {
        employeesNum += num;
      });
    }
    this.setState({
      departmentInfo: res,
      employeesNum: employeesNum,
    });
  }
  render(): ReactNode {
    const { departmentInfo, employeesNum } = this.state;
    const { companyName } = this.props;
    return (
      <div className="wk-department-detailes">
        <div className="wk-department-detailes-content">
          <div className="warp-info">
            <div className="warp-company-name">{companyName}</div>
            <div className="warp-department-name">{departmentInfo.name}</div>
            <div className="warp-department-num">- {employeesNum}人 - </div>
          </div>
        </div>
      </div>
    );
  }
}

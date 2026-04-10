import React from "react";
import { Component, ReactNode } from "react";
import { WKApp, WKNavMainHeader, Provider } from "@tsdaodao/base";
import { Tree } from "@douyinfe/semi-ui";
import { BasicTreeNodeData } from "@douyinfe/semi-foundation/lib/cjs/tree/foundation";
import { EmployeeDetails } from "./EmployeeDetails";
import { DepartmentDetails } from "./DepartmentDetails";
import WKAvatar from "@tsdaodao/base/src/Components/WKAvatar";

import "./index.css";

interface IRenderLabel {
  className: string;
  data: BasicTreeNodeData;
  onExpand: (e: any) => void;
  onClick: (e: any) => void;
  expandIcon: any;
}
const renderLabel = ({
  className,
  data,
  onExpand,
  onClick,
  expandIcon,
}: IRenderLabel) => {
  const { label } = data;
  const isLeaf = !(data.children && data.children.length);
  return (
    <li
      className={className}
      role="treeitem"
      onClick={isLeaf ? onClick : onExpand}
    >
      {isLeaf ? null : expandIcon}
      <span>{label}</span>
    </li>
  );
};

interface IOrganizational {
  organizationInfo: {
    name: string;
    is_upload_logo?: number;
    org_id?: string;
    short_no?: string;
  };
  treeData: any[];
  expandedKeys: string[];
}

export interface POrganizational {
  hideBack?: boolean;
}

export class Organizational extends Component<
  POrganizational,
  IOrganizational
> {
  state: IOrganizational = {
    organizationInfo: {
      name: "",
    },
    treeData: [],
    expandedKeys: [],
  };
  constructor(props: any) {
    super(props);
  }
  componentDidMount() {
    this.getJoinOrganization();
  }

  // 获取加入公司
  async getJoinOrganization() {
    const res = await WKApp.apiClient.get("/organization/joined");
    const organizationInfo = res[0];
    this.setState({
      organizationInfo: organizationInfo,
    });
    if (organizationInfo) {
      this.getOrganizationDepartment(organizationInfo.org_id);
    }
  }
  // 获取加入公司所有部门
  async getOrganizationDepartment(org_id: string) {
    const res = await WKApp.apiClient.get(
      `/organizations/${org_id}/department`
    );
    // 部门
    const departments: any = this.handleTree(res.departments);
    // 人员
    const employees: any[] = [];
    res.employees.map((y: any) => {
      employees.push({
        label: y.employee_name,
        value: y.employee_id,
        key: `uid_${y.uid}`,
        icon: (
          <WKAvatar
            src={WKApp.shared.avatarUser(y.uid as string)}
            style={{ width: "20px", height: "20px", marginRight: "6px" }}
          />
        ),
        is_employee: true,
        ...y,
      });
    });
    const expandedKeys: string[] = [];
    if (departments.length > 0) {
      expandedKeys.push(departments[0].key);
    }
    this.setState({
      treeData: [...departments, ...employees],
      expandedKeys: expandedKeys,
    });
  }
  // 处理全部子部门人数
  handelEmployeesNum(arr: any[]) {
    let employeesNums: number[] = [];
    arr.map((item) => {
      if (item.employees && item.employees.length > 0) {
        employeesNums.push(item.employees.length);
      }
      if (item.children && item.children.length > 0) {
        const employeesNum = this.handelEmployeesNum(item.children);
        employeesNums = [...employeesNums, ...employeesNum];
      }
    });
    return employeesNums;
  }

  handleTree(arr: any[]) {
    const OTree: any = [];
    arr.map((item: any) => {
      let children: any[] = [];
      let employeesNum: number = 0;
      // 获取当前部门人数
      if (item.employees) {
        employeesNum = parseInt(item.employees.length);
      }
      // 获取全部子部门人数
      if (item.children) {
        const employeesNums = this.handelEmployeesNum(item.children);
        employeesNums.map((num) => {
          employeesNum += num;
        });
      }
      // 有组织和人员
      if (item.children && item.employees) {
        children = this.handleTree(item.children);
        const employees: any[] = [];
        item.employees.map((y: any) => {
          employees.push({
            label: y.employee_name,
            value: y.employee_id,
            key: `${item.dept_id}_${y.employee_id}`,
            icon: (
              <WKAvatar
                src={WKApp.shared.avatarUser(y.uid as string)}
                style={{ width: "24px", height: "24px", marginRight: "6px" }}
              />
            ),
            is_employee: true,
            ...y,
          });
        });
        children = [...children, ...employees];
      }
      // 只有人员
      if (!item.children && item.employees) {
        const employees: any[] = [];
        item.employees.map((y: any) => {
          employees.push({
            label: y.employee_name,
            value: y.employee_id,
            key: `${item.dept_id}_${y.employee_id}`,
            icon: (
              <WKAvatar
                src={WKApp.shared.avatarUser(y.uid as string)}
                style={{ width: "20px", height: "20px", marginRight: "6px" }}
              />
            ),
            is_employee: true,
            ...y,
          });
        });
        children = [...children, ...employees];
      }

      OTree.push({
        label:
          employeesNum > 0 ? `${item.name}(${employeesNum})` : `${item.name}`,
        value: item.dept_id,
        key: item.short_no,
        icon: (
          <span
            className="department-icon"
            style={{ display: "flex", marginRight: "6px" }}
          >
            <svg
              width="24px"
              height="18px"
              viewBox="0 0 24 18"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                id="页面-1"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
              >
                <g
                  id="02"
                  transform="translate(-98.000000, -131.000000)"
                  fill="currentColor"
                  fillRule="nonzero"
                >
                  <g
                    id="wenjianjia"
                    transform="translate(98.000000, 131.000000)"
                  >
                    <path
                      d="M21.343573,4.88046647 C21.6937698,4.9154519 22.0439666,5.00291545 22.3941634,5.14285714 C22.7443602,5.28279883 23.0484784,5.47959184 23.3065182,5.73323615 C23.5645579,5.98688047 23.7580877,6.30612245 23.8871076,6.6909621 C24.0161275,7.07580175 24.0345589,7.5393586 23.9424018,8.08163265 C23.905539,8.22157434 23.8318134,8.56705539 23.7212249,9.1180758 C23.6106365,9.66909621 23.4816166,10.303207 23.3341653,11.0204082 C23.186714,11.7376093 23.0208313,12.4766764 22.8365172,13.2376093 C22.6522031,13.9985423 22.4771047,14.6501458 22.311222,15.1924198 C22.219065,15.5072886 22.0854373,15.8309038 21.9103389,16.1632653 C21.7352405,16.4956268 21.5094557,16.7973761 21.2329845,17.0685131 C20.9565134,17.3396501 20.624748,17.5626822 20.2376884,17.7376093 C19.8506288,17.9125364 19.3898435,18 18.8553326,18 L3.53883076,18 C3.15177114,18 2.75088797,17.9212828 2.33618124,17.7638484 C1.92147451,17.606414 1.53902275,17.3833819 1.18882596,17.0947522 C0.838629164,16.8061224 0.552942306,16.4562682 0.331765384,16.0451895 C0.110588461,15.6341108 0,15.1749271 0,14.6676385 L0,3.41107872 C0,2.34402332 0.304118268,1.50874636 0.912354805,0.905247813 C1.52059134,0.301749271 2.37765192,0 3.48353653,0 L17.0859173,0 C17.4914083,0 17.9107229,0.0743440233 18.343861,0.22303207 C18.7769991,0.371720117 19.1686666,0.577259475 19.5188634,0.839650146 C19.8690602,1.10204082 20.154747,1.40816327 20.375924,1.75801749 C20.5971009,2.10787172 20.7076894,2.48396501 20.7076894,2.88629738 L20.7076894,3.17492711 L19.2700394,3.17492711 C18.532783,3.17492711 17.6711145,3.17055394 16.6850341,3.16180758 C15.6989536,3.15306122 14.6483633,3.14868805 13.5332629,3.14868805 C12.4181626,3.14868805 11.3767879,3.14431487 10.4091389,3.13556851 C9.44148987,3.12682216 8.60746856,3.12244898 7.90707497,3.12244898 L6.63530767,3.12244898 C6.15609101,3.12244898 5.78285495,3.26676385 5.5155995,3.55539359 C5.24834405,3.84402332 5.04099069,4.2244898 4.89353941,4.696793 C4.74608813,5.20408163 4.58020543,5.74198251 4.39589133,6.31049563 C4.21157723,6.87900875 4.04569454,7.40816327 3.89824326,7.89795918 C3.71392915,8.47521866 3.52961505,9.03498542 3.34530095,9.57725948 C3.30843813,9.71720117 3.29000672,9.83090379 3.29000672,9.91836735 C3.29000672,10.2157434 3.39598733,10.4650146 3.60794855,10.6661808 C3.81990976,10.8673469 4.08255736,10.96793 4.39589133,10.96793 C4.96726505,10.96793 5.35432466,10.6268222 5.55707017,9.94460641 L7.02236728,4.85422741 C9.41845061,4.87172012 11.6117884,4.88046647 13.6023807,4.88046647 L21.343573,4.88046647 L21.343573,4.88046647 Z"
                      id="路径"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </span>
        ),
        dept_id: item.dept_id,
        org_id: item.org_id,
        name: item.name,
        is_department: true,
        children: children,
      });
    });
    return OTree;
  }

  onSelectOrganization(
    selectedKey: string,
    selected: boolean,
    selectedNode: BasicTreeNodeData
  ) {
    // 员工详情
    if (selectedNode.is_employee) {
      WKApp.routeRight.replaceToRoot(
        <EmployeeDetails
          orgId={selectedNode.org_id}
          employeeUid={selectedNode.uid}
        />
      );
    }

    // 部门详情
    if (selectedNode.is_department) {
      WKApp.routeRight.replaceToRoot(
        <DepartmentDetails
          orgId={selectedNode.org_id}
          deptId={selectedNode.dept_id}
          companyName={this.state.organizationInfo.name}
        />
      );
    }
  }

  onExpandOrganization(expandedKeys: string[]) {
    this.setState({ expandedKeys: expandedKeys });
  }

  render(): ReactNode {
    const style = {
      width: "100%",
      height: "100%",
    };
    const { organizationInfo, treeData, expandedKeys } = this.state;
    const { hideBack } = this.props;
    return (
      <div className="wk-organizational">
        <WKNavMainHeader
          title={organizationInfo?.name || "组织架构"}
        ></WKNavMainHeader>
        <div className="wk-organizational-content">
          <Tree
            treeData={treeData}
            filterTreeNode
            expandedKeys={expandedKeys}
            showFilteredOnly={true}
            style={style}
            className="organizational-tree"
            onSelect={(
              selectedKey: string,
              selected: boolean,
              selectedNode: BasicTreeNodeData
            ) => {
              this.onSelectOrganization(selectedKey, selected, selectedNode);
            }}
            onExpand={(expandedKeys: string[], expanded) => {
              this.onExpandOrganization(expandedKeys);
            }}
          />
        </div>
      </div>
    );
  }
}

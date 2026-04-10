import {
  IModule,
  WKApp,
  Menus,
} from "@tsdaodao/base";
import React from "react";
import ReactDOM from "react-dom";

import { Organizational } from "./Organizational/index";

export default class OrganizationalModule implements IModule {
  id(): string {
    return "OrganizationalModule";
  }
  init(): void {
    console.log("【OrganizationalModule】初始化");

    WKApp.menus.register("organizational", (param) => {
      const m = new Menus("organizational", "/organizational", "组织架构",
        <img alt='组织架构' src={require("./assets/organizationalTab.png")}></img>,
        <img alt='组织架构' src={require("./assets/organizationalTabSelected.png")}></img>, () => {
          WKApp.routeRight.replaceToRoot(<></>);
        })
      return m
    },2000)

    WKApp.route.register("/organizational", () => {
      return <Organizational hideBack={true}></Organizational>
    })
  }
}
import { IModule, WKApp, Menus, MessageContentTypeConst } from "@tsdaodao/base";
import React from "react";
import FavoritePage, { FavoriteMain } from "./Pages";
import { Toast } from "@douyinfe/semi-ui";


export default class FavoriteModule implements IModule {
  id(): string {
    return "FavoriteModule"
  }
  init(): void {
    console.log("【FavoriteModule】初始化")

    WKApp.endpoints.registerMessageContextMenus("contextmenus.favrority", (message) => {
      if (WKApp.shared.supportFavorites.includes(message.contentType)) {
        return {
          title: "收藏", onClick: () => {
            WKApp.dataSource.commonDataSource.favorities(message).then(() => {
              Toast.success("收藏成功")
            }).catch((err) => {
              Toast.error(err.msg)
            })
          }
        }
      }
      return null

    }, 1010)

    WKApp.menus.register("favorites", (param) => {
      const m = new Menus("favorites", "/favorites", "收藏",
        <img alt='收藏' src={require("./assets/FavoriteTab.png")}></img>,
        <img alt='收藏' src={require("./assets/FavoriteTabSelected.svg").default}></img>, () => {
          WKApp.routeRight.replaceToRoot(<FavoriteMain></FavoriteMain>)
        })
      return m
    }, 3000)

    WKApp.route.register("/favorites", () => {
      return <FavoritePage></FavoritePage>
    })

  }


}
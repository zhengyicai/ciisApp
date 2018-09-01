import { Routes } from "@angular/router";

import { HomePage } from '../desktop/home/home';
import { CommunityPage } from '../desktop/community/community';
import { BuildingPage } from '../desktop/building/building';
import { RoomPage } from '../desktop/room/room';
import { NewResidentPage } from '../desktop/newResident/newResident';
import { ResidentPage } from '../desktop/resident/resident';
import { EquipmentPage } from '../desktop/equipment/equipment';
import { BannerPage } from '../desktop/banner/banner';

import { ParameterPage } from '../system/parameter/parameter';
import { UserInfoPage } from '../system/userInfo/userInfo';
import { RolePage } from '../system/role/role';
import { UpdatePwPage } from '../system/updatePw/updatePw';
import { NoticePage } from '../system/notice/notice';
import { MessagePage } from '../system/message/message';

export const MainRoutes: Routes = [ // Routes类型的数组
    {
        path     : '',
        component: HomePage
    },
    {
        path     : 'desktop/home',//首页
        component: HomePage
    },{
        path     : 'desktop/community',//住宅小区
        component: CommunityPage
    },{
        path     : 'desktop/building',//楼栋管理
        component: BuildingPage
    },{
        path     : 'desktop/room',//房间管理
        component: RoomPage
    },{
        path     : 'desktop/newResident',//新住户管理
        component: NewResidentPage
    },{
        path     : 'desktop/resident',//住户管理
        component: ResidentPage
    },{
        path     : 'desktop/equipment',//设备管理
        component: EquipmentPage
    },{
        path     : 'desktop/banner',//广告轮播图
        component: BannerPage
    },{
        path     : 'system/parameter',//参数管理
        component: ParameterPage
    },{
        path     : 'system/userInfo',//用户管理
        component: UserInfoPage
    },{
        path     : 'system/role',//权限管理
        component: RolePage
    },{
        path     : 'system/updatePw',//修改密码
        component: UpdatePwPage
    },{
        path     : 'system/notice',//公告管理
        component: NoticePage
    },{
        path     : 'system/message',//消息管理
        component: MessagePage
    },{
        path     : '**',
        component: HomePage
    },
];

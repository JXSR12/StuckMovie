import PeopleIcon from '@material-ui/icons/People';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ScheduleIcon from '@material-ui/icons/Schedule';
import LocalMoviesIcon from '@material-ui/icons/LocalMovies';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import FastfoodIcon from '@material-ui/icons/Fastfood';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import CategoryIcon from '@material-ui/icons/Category';
import TodayIcon from '@material-ui/icons/Today';
import WarningIcon from '@material-ui/icons/Warning';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import TableChartIcon from '@material-ui/icons/TableChart';
import { createStyles, makeStyles } from '@material-ui/styles';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import GroupIcon from '@material-ui/icons/Group';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import EventIcon from '@material-ui/icons/Event';
import { Theme } from '@material-ui/core';
import Router from 'next/router';
import { SidebarNav } from './sidebar_nav_manager';
import KitchenIcon from '@material-ui/icons/Kitchen';

export interface App{
    title: string;
    category: string;
    icon: any;
    path: string;
    access: string;
}

export class AppManager{
    static searchString = "";

    static handleDefaultSearchClick = () => {
        if(Router.pathname !== '/searchlist'){
            Router.push('/searchlist');
            SidebarNav.currentPathname = '/searchlist';
        }
    }

    static applications = [
        {title: 'Employees', category: 'Management', icon: <PeopleIcon fontSize='large'/>, path: '/next', access: 'MANAGEMENT_DEFAULT'} as App,
        {title: 'Requests', category: 'Management', icon: <InboxIcon fontSize='large'/>, path: '/pendings', access: 'MANAGEMENT_INTERNAL'} as App,
        {title: 'My Leave Requests', category: 'Employee Services', icon: <ExitToAppIcon fontSize='large'/>, path: '/myleaverequests', access: 'ESS_DEFAULT'} as App,
        {title: 'Department Funds', category: 'Employee Services', icon: <MonetizationOnIcon fontSize='large'/>, path: '/myfundrequests', access: 'ESS_DEFAULT'} as App,
        {title: 'My Working Time', category: 'Employee Services', icon: <ScheduleIcon fontSize='large'/>, path: '/myworkingtime', access: 'ESS_DEFAULT'} as App,
        {title: 'Movies', category: 'Operations', icon: <LocalMoviesIcon fontSize='large'/>, path: '/movies', access: 'OPERATIONS_DEFAULT'} as App,
        {title: 'Schedules', category: 'Operations', icon: <TodayIcon fontSize='large'/>, path: '', access: 'OPERATIONS_DEFAULT'} as App,
        {title: 'Theatres', category: 'Operations', icon: <MeetingRoomIcon fontSize='large'/>, path: '/theatres', access: 'OPERATIONS_DEFAULT'} as App,
        {title: 'Inventory', category: 'Storage Management', icon: <CategoryIcon fontSize='large'/>, path: '/storageitems', access: 'STORAGE_DEFAULT'} as App,
        {title: 'Reports', category: 'Storage Management', icon: <AssignmentLateIcon fontSize='large'/>, path: '', access: 'STORAGE_DEFAULT'} as App,
        {title: 'Movie Ticket', category: 'New Transaction', icon: <ConfirmationNumberIcon fontSize='large'/>, path: '', access: 'FROFC_DEFAULT'} as App,
        {title: 'Food and Beverage', category: 'New Transaction', icon: <FastfoodIcon fontSize='large'/>, path: '', access: 'FROFC_DEFAULT'} as App,
        {title: 'Concessions', category: 'Operations', icon: <FastfoodIcon fontSize='large'/>, path: '/concessions', access: 'OPERATIONS_DEFAULT'} as App,
        {title: 'Concession Items', category: 'Storage Management', icon: <KitchenIcon fontSize='large'/>, path: '/fnbitems', access: 'STORAGE_DEFAULT'} as App,
        {title: 'My Warning Letters', category: 'Employee Services', icon: <WarningIcon fontSize='large'/>, path: '/mywarningletters', access: 'ESS_DEFAULT'} as App,
        {title: 'My Attendance', category: 'Employee Services', icon: <TableChartIcon fontSize='large'/>, path: '/myattendance', access: 'ESS_DEFAULT'} as App,
        {title: 'Attendance Data', category: 'Management', icon: <TableChartIcon fontSize='large'/>, path: '/attendances', access: 'MANAGEMENT_DEFAULT'} as App,
        {title: 'Reset Employee Password', category: 'Administration', icon: <VpnKeyIcon fontSize='large'/>, path: '/resetpassword', access: 'ADMINISTRATION_DEFAULT'} as App,
        {title: 'Movie Producers', category: 'External', icon: <SupervisedUserCircleIcon fontSize='large'/>, path: '/producers', access: 'EXTERNAL_DEFAULT'} as App,
        {title: 'Members', category: 'Membership and Events', icon: <GroupIcon fontSize='large'/>, path: '/members', access: 'PROMOTIONEVENT_DEFAULT'} as App,
        {title: 'Vouchers', category: 'Membership and Events', icon: <CardGiftcardIcon fontSize='large'/>, path: '', access: 'PROMOTIONEVENT_DEFAULT'} as App,
        {title: 'Promotion and Events', category: 'Membership and Events', icon: <EventIcon fontSize='large'/>, path: '/events', access: 'PROMOTIONEVENT_DEFAULT'} as App,
     ];
}
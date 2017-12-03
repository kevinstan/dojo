import { StackNavigator } from 'react-navigation';
import { TabNav } from './TabNav';
import { AddBillScreen } from './AddBillScreen';
import { AddTaskScreen } from './AddTaskScreen';
import { EditTaskScreen } from './EditTaskScreen';
import { EditBillScreen } from './EditBillScreen';
import { TaskDetailsScreen } from './TaskDetailsScreen';
import { JoinDojoScreen } from './JoinDojoScreen';
import { NotInDojoScreen } from './NotInDojoScreen';
import { BillDetailsScreen } from './BillDetailsScreen';
import { DojoQRCodeScreen } from './DojoQRCodeScreen';
import { DojoSettingsScreen } from './DojoSettingsScreen';

const options = {};

export const MainNav = StackNavigator(
  {
    Home: { screen: TabNav },
    AddBill: { screen: AddBillScreen },
    EditBill: { screen: EditBillScreen },
    AddTask: { screen: AddTaskScreen },
    EditTask: { screen: EditTaskScreen },
    TaskDetails: { screen: TaskDetailsScreen },
    NotInDojo: { screen: NotInDojoScreen },
    JoinDojo: { screen: JoinDojoScreen },
    BillDetails: { screen: BillDetailsScreen },
    DojoQRCode: { screen: DojoQRCodeScreen },
    DojoSettings: { screen: DojoSettingsScreen }
  },
  options
);

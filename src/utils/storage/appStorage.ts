import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStorageAccess } from "./access";

/** All app-data persistence goes through this gate, including appearance. */
const appStorage = createStorageAccess(AsyncStorage);
export default appStorage;

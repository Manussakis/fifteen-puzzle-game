import Model from './model';
import View from './view';
import Controller from './controller';

const appModel = new Model();
const appView = new View();
const app = new Controller( appModel, appView );

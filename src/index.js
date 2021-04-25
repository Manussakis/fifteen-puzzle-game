import './scss/style.scss';

import Model from './js/model';
import View from './js/view';
import Controller from './js/controller';

const appModel = new Model();
const appView = new View();

new Controller( appModel, appView );

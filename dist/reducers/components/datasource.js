'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _arrayFrom = require('array-from');

var _arrayFrom2 = _interopRequireDefault(_arrayFrom);

exports.default = dataSource;

var _immutable = require('immutable');

var _ActionTypes = require('../../constants/ActionTypes');

var _lastUpdate = require('./../../util/lastUpdate');

var _getTreePathFromId = require('./../../util/getTreePathFromId');

var _setTreeValue = require('./../../util/setTreeValue');

var _treeToFlatList = require('./../../util/treeToFlatList');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _arrayFrom2.default)(arr); } }

var initialState = (0, _immutable.fromJS)({ lastUpdate: (0, _lastUpdate.generateLastUpdate)() });

function dataSource() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    switch (action.type) {

        case _ActionTypes.SET_DATA:
            return state.setIn([action.stateKey], (0, _immutable.fromJS)({
                data: action.data,
                proxy: action.data,
                total: action.total || action.data.length,
                treeData: action.treeData,
                gridType: action.gridType || 'grid',
                currentRecords: action.currentRecords || action.data,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            }));

        case _ActionTypes.SET_TREE_DATA_PARTIAL:
            var treeVals = state.getIn([action.stateKey, 'treeData']).toJS();
            var flattened = state.getIn([action.stateKey, 'data']).toJS();
            var pathToNode = [-1].concat(_toConsumableArray((0, _getTreePathFromId.getTreePathFromId)(flattened, action.parentId)));
            var newTreeValues = (0, _setTreeValue.setTreeValue)(treeVals, pathToNode, { children: action.data });

            var newFlatList = (0, _treeToFlatList.treeToFlatList)(newTreeValues);

            if (!action.showTreeRootNode) {
                newFlatList.shift();
            }

            return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                data: newFlatList,
                proxy: newFlatList,
                currentRecords: newFlatList,
                treeData: newTreeValues,
                total: newFlatList.length,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            }));

        case _ActionTypes.DISMISS_EDITOR:
            var previousData = state.getIn([action.stateKey, 'data']);
            var previousProxy = state.getIn([action.stateKey, 'proxy']);
            var previousTotal = state.getIn([action.stateKey, 'total']);

            // upon dismiss, if a new row was in edit
            // but isn't save, update the total to reflect that
            if (previousData && previousProxy && previousData.size > previousProxy.size) {
                previousTotal = previousProxy.size;
            }

            if (state.get(action.stateKey)) {
                return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                    data: previousProxy,
                    proxy: previousProxy,
                    currentRecords: previousProxy,
                    total: previousTotal,
                    isEditing: false,
                    lastUpdate: (0, _lastUpdate.generateLastUpdate)()
                }));
            }

            return state;

        case _ActionTypes.REMOVE_ROW:
            var remainingRows = state.getIn([action.stateKey, 'data']).remove(action.rowIndex || 0, 1);

            return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                data: remainingRows,
                proxy: remainingRows,
                currentRecords: remainingRows,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            }));

        case _ActionTypes.UPDATE_ROW:

            var existingData = state.getIn([action.stateKey, 'data']);
            var prevRow = existingData ? existingData.get(action.rowIndex) : null;

            if (!prevRow) {
                return state;
            }

            var updatedRow = prevRow.merge(action.values);
            var updatedData = state.getIn([action.stateKey, 'data']).set(action.rowIndex, updatedRow);

            return state.mergeIn([action.stateKey], {
                data: updatedData,
                proxy: updatedData,
                currentRecords: updatedData,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            });

        case _ActionTypes.ADD_NEW_ROW:

            var existingState = state.get(action.stateKey);
            var isEditing = existingState && existingState.get('isEditing');
            var data = existingState && existingState.get('data');

            if (existingState && isEditing) {
                return state;
            }

            var newRow = data && data.size > 0 && data.get(0) ? data.get(0).map(function (k, v) {
                return v = '';
            }) : (0, _immutable.fromJS)({});

            var newData = data.unshift(newRow);

            return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                data: newData,
                proxy: data,
                isEditing: true,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)(),
                total: newData.size
            }));

        case _ActionTypes.SET_TREE_NODE_VISIBILITY:

            var treeFlatList = state.getIn([action.stateKey, 'data']).toJS();
            var tree = state.getIn([action.stateKey, 'treeData']).toJS();
            var currentVisibility = !!treeFlatList.find(function (node) {
                return node._id === action.id;
            })._hideChildren;
            var path = [-1].concat(_toConsumableArray((0, _getTreePathFromId.getTreePathFromId)(treeFlatList, action.id)));
            var newTree = (0, _setTreeValue.setTreeValue)(tree, path, { _hideChildren: !currentVisibility
            });
            var flattenedTree = (0, _treeToFlatList.treeToFlatList)(newTree);

            // remove root-node
            if (!action.showTreeRootNode) {
                flattenedTree.shift();
            }

            return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                data: flattenedTree,
                currentRecords: flattenedTree,
                treeData: newTree,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            }));

        case _ActionTypes.SAVE_ROW:
            var gridData = state.getIn([action.stateKey, 'data']).set(action.rowIndex, (0, _immutable.fromJS)(action.values));

            return state.mergeIn([action.stateKey], (0, _immutable.fromJS)({
                data: gridData,
                proxy: gridData,
                currentRecords: gridData,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            }));

        case _ActionTypes.SORT_DATA:
            return state.mergeIn([action.stateKey], {
                data: action.data,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            });

        case _ActionTypes.CLEAR_FILTER_LOCAL:

            var proxy = state.getIn([action.stateKey, 'proxy']);
            var prevData = state.getIn([action.stateKey, 'data']);
            var recs = proxy || prevData;

            return state.mergeIn([action.stateKey], {
                data: recs,
                proxy: recs,
                currentRecords: recs,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            });

        case _ActionTypes.FILTER_DATA:
            return state.mergeIn([action.stateKey], {
                data: action.data,
                lastUpdate: (0, _lastUpdate.generateLastUpdate)()
            });

        default:

            return state;
    }
}
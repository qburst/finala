import React, { Fragment, useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import numeral from "numeral";
import MUIDataTable from "mui-datatables";
import TextUtils from "utils/Text";
import TagsDialog from "../Dialog/Tags";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { getHistory } from "../../utils/History";
import { useTableFilters } from "../../Hooks/TableHooks";
import CustomToolbar from "./CustomToolbar";

import {
  Card,
  CardContent,
  LinearProgress,
  Box,
  Typography,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

import Moment from "moment";

const useStyles = makeStyles(() => ({
  Card: {
    marginBottom: "20px",
  },
  CardContent: {
    padding: "30px",
    textAlign: "center",
  },
  noDataTitle: {
    textAlign: "center",
    fontWeight: "bold",
    margin: "5px",
    fontSize: "14px",
  },
  AlertIcon: {
    fontSize: "56px",
    color: "red",
  },
  progress: {
    margin: "30px",
  },
  categoryBanner: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "12px 16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
    fontSize: "0.9rem",
    transition: "background-color 0.2s ease",
  },
  costSavingBanner: {
    borderLeftColor: "#d69e2e",
    borderLeftWidth: "4px",
    color: "#975a16",
    backgroundColor: "#fffbeb",
    "&:hover": {
      backgroundColor: "#fef3c7",
    },
  },
  unusedBanner: {
    borderLeftColor: "#38a169",
    borderLeftWidth: "4px", 
    color: "#22543d",
    backgroundColor: "#f0fff4",
    "&:hover": {
      backgroundColor: "#c6f6d5",
    },
  },
}));

/**
 * @param  {array} {resources  Resources List
 * @param  {string} currentResource  Current Selected Resource
 * @param  {array} currentResourceData  Current Selected Resource data
 * @param  {bool} isResourceTableLoading  isLoading indicator for table}
 */
const ResourceTable = ({
  resources,
  currentResource,
  currentResourceData,
  isResourceTableLoading,
  addFiltersObject,
  removeFiltersObject,
  getCols,
  checkUncheckColumns,
  dispatchSearchText,
}) => {
  const [headers, setHeaders] = useState([]);
  const [errorMessage, setErrorMessage] = useState(false);
  const [hasError, setHasError] = useState(false);
  const classes = useStyles();
  const [setTableFilters] = useTableFilters({});
  const [tableOptions, setTableOptions] = useState({});

  // setting table configuration on first load
  useEffect(() => {
    setTableOptions({
      page: parseInt(getHistory("page", 0)),
      searchText: getHistory("search", ""),
      sortOrder: {
        name: getHistory("sortColumn", ""),
        direction: getHistory("direction", "desc"),
      },
      selectableRows: "none",
      responsive: "standard",
    });
  }, []);

  /**
   * format table cell by type
   * @param {string} key TableCell key
   * @returns {func} render function to render cell
   */
  const getRowRender = (key) => {
    let renderr = false;
    switch (key) {
      case "PricePerMonth":
      case "TotalSpendPrice":
        renderr = (data) => <span>{numeral(data).format("$ 0,0[.]00")}</span>;
        break;
      case "PricePerHour":
        renderr = (data) => <span>{numeral(data).format("$ 0,0[.]000")}</span>;
        break;
      case "Tag":
        renderr = (data) => <TagsDialog tags={data} />;
        break;
      case "LaunchTime":
        renderr = (data) => (
          <span>{Moment(data).format("YYYY-MM-DD HH:mm")}</span>
        );
        break;
      default:
        renderr = (data) => <span>{`${data}`}</span>;
    }
    return renderr;
  };

  /**
   * determines Table header keys
   * @param {object} exampleRow  sample row from data
   * @returns {array} Table header keys
   */
  const getHeaderRow = (row) => {
    const exclude = ["TotalSpendPrice"];
    const keys = Object.keys(row).reduce((filtered, headerKey) => {
      if (exclude.indexOf(headerKey) === -1) {
        const header = {
          name: headerKey,
          label: TextUtils.CamelCaseToTitleCase(headerKey),
          options: {
            customBodyRender: getRowRender(headerKey),
          },
        };
        filtered.push(header);
      }
      return filtered;
    }, []);
    return keys;
  };

  /**
   * Detect resource data changed
   */
  var filterNameArray;
  useEffect(() => {
    let headers = [];
    if (currentResourceData.length) {
      headers = getHeaderRow(currentResourceData[0]);
    }
    filterNameArray = headers && headers.map((obj) => obj.name);
    checkUncheckColumns(filterNameArray);
    setHeaders(headers);
  }, [currentResourceData]);
  /**
   * Detect if we have an error
   */
  useEffect(() => {
    if (!currentResource) {
      return;
    }
    const resourceInfo = resources[currentResource];
    if (resourceInfo && resourceInfo.Status === 1) {
      setHasError(true);
      setErrorMessage(resourceInfo.ErrorMessage);
      return;
    } else {
      setHasError(false);
    }
  }, [currentResource, resources]);

  return (
    <Fragment>
      {!hasError && isResourceTableLoading && (
        <Card className={classes.Card}>
          <CardContent className={classes.CardContent}>
            <div className={classes.noDataTitle}>
              <LinearProgress className={classes.progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {!isResourceTableLoading && (hasError || !currentResourceData.length) && (
        <Card className={classes.Card}>
          <CardContent className={classes.CardContent}>
            {(hasError || !currentResourceData.length) &&
              !isResourceTableLoading && (
                <ReportProblemIcon className={classes.AlertIcon} />
              )}

            {hasError && (
              <h3>
                {
                  " Finala couldn't scan the selected resource, please check system logs "
                }
              </h3>
            )}

            {!isResourceTableLoading &&
              !hasError &&
              !currentResourceData.length &&
              !headers.length && (
                <div className={classes.noDataTitle}>
                  <h3>No data found.</h3>
                </div>
              )}

            {errorMessage && <h4>{errorMessage}</h4>}
          </CardContent>
        </Card>
      )}

      {!hasError &&
        currentResourceData.length > 0 &&
        !isResourceTableLoading && (
          <div id="resourcewrap">
            {/* Category Indicator */}
            {currentResource && resources[currentResource] && (
              <Box
                className={`${classes.categoryBanner} ${
                  resources[currentResource].TotalSpent > 0 
                    ? classes.costSavingBanner 
                    : classes.unusedBanner
                }`}
              >
                <Typography>
                  {resources[currentResource].TotalSpent > 0 
                    ? "💰 Potential Cost Saving Resource"
                    : "🗑️ Unused Resource"
                  }
                </Typography>
              </Box>
            )}
            {/* {"GET FLITES object :-" + JSON.stringify(getFlits, null, 2)}
          {"GET cols array:-" + JSON.stringify(getCols, null, 2)} */}
            <MUIDataTable
              data={currentResourceData}
              columns={headers}
              options={Object.assign(tableOptions, {
                customSearch: () => {
                  // You can return your custom icon component here
                  return "EMAIL";
                },
                onSearchChange: (searchText) => {
                  dispatchSearchText(searchText);
                  setTableFilters([
                    {
                      key: "search",
                      value: searchText ? searchText : "",
                    },
                  ]);
                },
                onColumnSortChange: (changedColumn, direction) => {
                  setTableFilters([
                    { key: "sortColumn", value: changedColumn },
                    { key: "direction", value: direction },
                  ]);
                },
                onChangePage: (currentPage) => {
                  setTableFilters([{ key: "page", value: currentPage }]);
                },
                onChangeRowsPerPage: (numberOfRows) => {
                  setTableFilters([{ key: "rows", value: numberOfRows }]);
                },
                downloadOptions: {
                  filename: `${currentResource}.csv`,
                },
                customToolbar: () => {
                  return <CustomToolbar />;
                },
                onFilterChipClose: (index, removedFilter, filterList) => {
                  removeFiltersObject({
                    column: "Data." + removedFilter,
                    index: index,
                    filterList: filterList,
                  });
                },
                onFilterChange: (column, filterList, type, index) => {
                  addFiltersObject({
                    ["Data." + column]: String(filterList[index][0]),
                  });
                },
                onColumnViewChange: (changedColumn, action) => {
                  // Callback when the columns are shown or hidden
                  var filterNameArrayNew = getCols;
                  if (action === "remove") {
                    const index = filterNameArrayNew.indexOf(changedColumn);
                    if (index > -1) {
                      // only splice array when item is found
                      filterNameArrayNew.splice(index, 1); // 2nd parameter means remove one item only
                    }
                    // setSelectedColumns(selectedColumns.filter((col) => col !== changedColumn));
                  } else {
                    if (filterNameArrayNew.indexOf(changedColumn) === -1) {
                      filterNameArrayNew.push(changedColumn);
                    }
                    // setSelectedColumns([...selectedColumns, changedColumn]);
                  }
                  checkUncheckColumns(filterNameArrayNew);
                },
              })}
            />
          </div>
        )}
    </Fragment>
  );
};

ResourceTable.defaultProps = {};
ResourceTable.propTypes = {
  currentResource: PropTypes.string,
  resources: PropTypes.object,
  currentResourceData: PropTypes.array,
  isResourceTableLoading: PropTypes.bool,
  addFiltersObject: PropTypes.func,
  removeFiltersObject: PropTypes.func,
  dispatchSearchText: PropTypes.func,
  getCols: PropTypes.array,
  checkUncheckColumns: PropTypes.func,
};
const mapStateToProps = (state) => ({
  resources: state.resources.resources,
  currentResourceData: state.resources.currentResourceData,
  currentResource: state.resources.currentResource,
  isResourceTableLoading: state.resources.isResourceTableLoading,
  getCols: state.cols,
});
const mapDispatchToProps = (dispatch) => ({
  addFiltersObject: (data) => dispatch({ type: "ADD_IN_OBJECT", data }),
  removeFiltersObject: (data) => dispatch({ type: "REMOVE_IN_OBJECT", data }),
  dispatchSearchText: (data) => dispatch({ type: "ON_TEXT_ENTERED", data }),
  checkUncheckColumns: (data) =>
    dispatch({ type: "CHECK_UNCHECK_COLUMNS_CHECKBOX", data }),
});
export default connect(mapStateToProps, mapDispatchToProps)(ResourceTable);

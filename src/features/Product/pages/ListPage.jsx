import { Box, Container, Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import productsApi from 'api/productApi';
import ProductSkeletonList from '../components/ProductSkeletonList';
import ProductList from '../components/ProductList';
import { Pagination } from '@mui/material';
import ProductSort from '../components/ProductSort';
import ProductFilters from '../components/ProductFilters';
import MenuSkeletonList from '../components/MenuSkeletonList';
import FilterViewer from '../components/FilterViewer';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import queryString from 'query-string';
const useStyles = makeStyles(theme => ({
    root: {},
    left: {
        width:'22.6%',
    },
    right:{
        flex: '1 1 0',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        flexFlow: 'center',
        marginTop:'30px',
        paddingBottom: '20px',
    }
}))

function ListPage(props) {
    const classes = useStyles();

    const history = useHistory();
    const location = useLocation();
    const queryParams =  queryString.parse(location.search);

    // const [productFilters,setProductFilters] = useState([])
    const [productList,setProductList] = useState([])
    const [pagination,setPagination] = useState({
        limit: 9,
        total: 10,
        page : 1,
    })
    const [loading,setLoading] = useState(true)
    const [filters,setFilters] = useState(() => ({
        ...queryParams,
        _page: Number.parseInt(queryParams._page ) || 1,
        _limit: Number.parseInt(queryParams._limit)  || 9,
        _sort:queryParams._sort || 'salePrice:ASC',
    }))

    useEffect(() =>{
        // Sync filters to URL 
        history.push({
            pathName: history.location.pathName,
            search: queryString.stringify(filters),
        })
    },[history,filters])

    useEffect(() =>{
        (async () => {
            try {
                const {data , pagination} = await productsApi.getAll(filters);
                // console.log({data , pagination});
                setProductList(data);
                setPagination(pagination)
            } catch (error) {
                console.log('Failed to get all products:' , error);
            }
            setLoading(false);
        })();
    },[filters])
    const handlePageChange = (e,page) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            _page: page
        }))
    }
    const handleSortChange = (newSortValue) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            _sort: newSortValue,
        }))
    }
    const handleFiltersChange = (newFilters) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }))
    }
    const setNewFilters = (newFilters) => {
        setFilters(newFilters);
    }
  return (
    <Box>
        <Container>
            <Grid container spacing={1}>
                <Grid item className={classes.left}>
                    <Paper elevation={0}>
                        {/* <ProductFilters filters={filters} onChange={handleFiltersChange}/> */}
                            {loading ? <MenuSkeletonList length={6}/> : <ProductFilters filters={filters} onChange={handleFiltersChange}/>}
                    </Paper>
                </Grid>
                <Grid item className={classes.right}>
                    <Paper elevation={0}>
                    <ProductSort currentSort={filters._sort} onChange={handleSortChange}/>
                    <FilterViewer filters={filters} onChange={setNewFilters}/>
                        {loading ? <ProductSkeletonList length={9}/> : <ProductList data = {productList}/>}
                        <Box className={classes.pagination}>
                            <Pagination 
                                color='primary' 
                                count={Math.ceil(pagination.total/pagination.limit)} 
                                page={pagination.page}
                                onChange={handlePageChange}
                                >
                            </Pagination>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    </Box>
  )
}

export default ListPage

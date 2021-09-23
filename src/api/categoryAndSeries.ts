import type { CategoryT } from '@/@types/category';
import type { SeriesT } from '@/@types/series';
import Service from '../http';
const service = new Service();

const ALL_CATEGORY_URL = '/api/category';
const ALL_SERIES_URL = '/api/category/s';
const ADD_CATEGORY = '/api/category/add';
const DELETE_CATEGORY = '/api/category/delete';
const UPDATE_CATEGORY = '/api/category/update';
const ADD_SERIES = '/api/category/s/add';
const DELETE_SERIES = '/api/category/s/delete';
const UPDATE_SERIES = '/api/category/s/update';

export const fetchCategories = () => service.getData(ALL_CATEGORY_URL);
export const fetchSeriesByCategoryId = (id: string) => service.getData(`${ALL_CATEGORY_URL}/${id}`);
export const fetchSeries = (category_id: string) => service.getData(`${ALL_SERIES_URL}/${category_id}`);

export const addCategory = (data: CategoryT) => service.postData(ADD_CATEGORY, data);
export const editCategory = (data: Partial<CategoryT>) =>
  service.putData(UPDATE_CATEGORY, data);
export const deleteCategory = (data: { id: string | React.Key }) =>
  service.delData(DELETE_CATEGORY, { data });

export const addSeries = (data: SeriesT) => service.postData(ADD_SERIES, data);
export const editSeries = (data: Partial<SeriesT>) =>
  service.putData(UPDATE_SERIES, data);
export const deleteSeries = (data: { id: string | React.Key }) =>
  service.delData(DELETE_SERIES, { data });

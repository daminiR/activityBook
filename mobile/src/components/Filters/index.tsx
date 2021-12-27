import styles, {SECONDARY_THEME, DIMENSION_HEIGHT} from '../../assets/styles';
import React, {useState} from 'react';
import {TouchableOpacity } from 'react-native';
import {Icon } from 'react-native-elements';
import _ from 'lodash'
import {FilterOverlaySingle} from '../FilterOverlaySingle'


const Filters = () => {
  const [filter, setFilter] = useState(false);
  const _onFilter = () => {
    setFilter(true);
  };

        //<Text style={styles.filtersText}>Filters
        //</Text>
  return (
    <>
      <FilterOverlaySingle filter={filter} setFilter={setFilter} />
      <TouchableOpacity onPress={() => _onFilter()}style={styles.filters}>
        <Icon name="filter-alt" type="material" color={SECONDARY_THEME} size={DIMENSION_HEIGHT * 0.03}/>
      </TouchableOpacity>
    </>
  );
};

export {Filters}
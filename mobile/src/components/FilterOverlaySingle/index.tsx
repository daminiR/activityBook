import styles from '../../assets/styles';
import React, { createContext, useEffect,useContext, useState } from 'react'
import FilterChip from '../FilterChip'
import { View, Text } from 'react-native';
import {Overlay, CheckBox, Card} from 'react-native-elements'
import {UserContext} from '../../UserContext'
import { Cancel, Done, } from '..'
import FilterSportsChips from '../FilterSportsChips'
import _ from 'lodash'
import {FilterFields} from '../../localModels/UserSportsList'
import GameLevelCheckBox from '../GameLevelCheckBox'
import AgeSliderFilter from '../AgeSliderFilter'
import {_retriveGameLevel, _retriveAgeRangeFilter, _retriveSportFilter} from '../../utils/AsyncStorage/retriveData'
import {defaultAgeRange, defaultGameLevel} from '../../constants'
import { useFormikContext, Formik, ErrorMessage} from 'formik'
import {FilterSchema} from '../../validationSchemas/FilterSchema'
import {createInitialFilterFormik} from '../../utils/formik/index'
import MultiSlider from '@ptomasroos/react-native-multi-slider'
import {_storeAgeRangeFilter, _storeGameLevelFilter, _storeSportFilter} from '../../utils/AsyncStorage/storeData'

  //// TODO : this needs to update every time user changes list of activities
export const FilterSportContext = createContext(null);
const FilterOverlaySingle = ({filter, setFilter}) => {
  const {handleReset, setValues, values: filterValues } = useFormikContext<FilterFields>();
  const {aloading, currentUser, data: currentUserData, userLoading} = useContext(UserContext)
  const [loadingSports, setLoadingSports] = useState(true)
  const [sportsList, setSportsList] = useState(null)
  const [multiSliderValue, setMultiSliderValue] = useState(defaultAgeRange);
  const [selectedSport, setSelectedSport] = useState(null)


  const [allUserSportsFilter, setAllUserSportsFilter] = useState(filterValues.sportFilters);

  const [gameLevel1, setGameLevel1] = useState(false);
  const [gameLevel2, setGameLevel2] = useState(false);
  const [gameLevel0, setGameLevel0] = useState(false);

  const value = {
    allUserSportsFilter: allUserSportsFilter,
    setAllUserSportsFilter: setAllUserSportsFilter,
  };
  useEffect(() => {
    setGameLevel0(filterValues.gameLevels.gameLevel0);
    setGameLevel1(filterValues.gameLevels.gameLevel1);
    setGameLevel2(filterValues.gameLevels.gameLevel2);

    // age changes if any
    setMultiSliderValue(filterValues.ageRange)

    /// sport filter
    setAllUserSportsFilter(filterValues.sportFilters)

  }, [filter]);

  useEffect(() => {
    if(currentUserData){
        setLoadingSports(true);
        const sports = _.map(currentUserData.squash.sports, (sportObj) => {return sportObj.sport});
        setSportsList(sports);
        setLoadingSports(false);
    }
  }, [userLoading]);

  const _onCancel = () => {
    console.log("is this working")
    //handleReset()
    setFilter(false)
  };
  const _onDone = () => {
    const gameLevelObj = {
      gameLevel0: gameLevel0,
      gameLevel1: gameLevel1,
      gameLevel2: gameLevel2,
    };
    setValues({... filterValues, 'ageRange': multiSliderValue, 'gameLevels': gameLevelObj, 'sportFilters': allUserSportsFilter});
    _storeAgeRangeFilter(multiSliderValue)
    _storeSportFilter(allUserSportsFilter)
    _storeGameLevelFilter(gameLevelObj);
    setFilter(false)
  };

  const _onPressGameLevel = (gameLevel) => {
    switch (gameLevel) {
      case 0:
        setGameLevel0(!gameLevel0);
        break;
      case 1:
        setGameLevel1(!gameLevel1);
        break;
      case 2:
        setGameLevel2(!gameLevel2);
        break;
    }
  };
  const renderFilter = () => {
  return (
    // TODO:set the sports car filters, age, and game level thats all for now
    <Overlay isVisible={filter}>
      <View>
        <View style={styles.top}>
          <Cancel _onPressCancel={_onCancel} />
          <Done _onPressDone={_onDone} />
        </View>
        <View style={styles.filterOverlay}>
          <View>
            <Text>
              Age between {multiSliderValue.minAge} and{' '}
              {multiSliderValue.maxAge}
            </Text>
            <MultiSlider
              values={[multiSliderValue.minAge, multiSliderValue.maxAge]}
              onValuesChange={(values) =>
                setMultiSliderValue({minAge: values[0], maxAge: values[1]})
              }
              min={defaultAgeRange.minAge}
              max={defaultAgeRange.maxAge}
              step={1}
              allowOverlap
              snapped
            />
            <View style={styles.sportChipSet}>
              {!loadingSports && (
                <FilterSportContext.Provider value={value}>
                  <Card containerStyle={styles.CardStyle}>
                    <Card.Title> List of Acitivities</Card.Title>
                    <Card.Divider />
                    <View style={styles.sportChipSet}>
                      {allUserSportsFilter.map((sportObj, i) => (
                        <FilterChip key={i} sport={sportObj.sport} />
                      ))}
                    </View>
                  </Card>
                </FilterSportContext.Provider>
              )}
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <Text style={styles.filtersText}>Filter level for:</Text>
            <CheckBox
              title="Beginner"
              checked={gameLevel0}
              onPress={() => _onPressGameLevel(0)}
            />
            <CheckBox
              title="Intermediate"
              checked={gameLevel1}
              onPress={() => _onPressGameLevel(1)}
            />
            <CheckBox
              title="Advanced"
              checked={gameLevel2}
              onPress={() => _onPressGameLevel(2)}
            />
          </View>
        </View>
      </View>
    </Overlay>
  );
  }
  return (
      renderFilter()
  );
};

export {FilterOverlaySingle}
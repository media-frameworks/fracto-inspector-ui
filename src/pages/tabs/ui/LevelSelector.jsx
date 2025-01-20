import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {TabUiStyles as styles} from "../../styles/TabUiStyles";

export const SELECTOR_TYPE_HORZ = 'selector_type_horz'
export const SELECTOR_TYPE_VERT = 'selector_type_vert'

export class LevelSelector extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      selected_level: PropTypes.number.isRequired,
      on_level_changed: PropTypes.func.isRequired,
      level_limit: PropTypes.number,
      selector_type: PropTypes.oneOf([SELECTOR_TYPE_HORZ, SELECTOR_TYPE_VERT]),
   }

   static defaultProps = {
      level_limit: 35,
      selector_type: SELECTOR_TYPE_HORZ,
   }

   state = {}

   componentDidMount() {
   }

   render() {
      const {width_px, level_limit, selected_level, on_level_changed} = this.props
      const button_list = []
      const button_width = Math.floor(width_px / (level_limit - 3)) - 6
      for (let level_index = 3; level_index <= level_limit; level_index++) {
         let button_style = {minWidth: `${button_width}px`}
         if (selected_level === level_index) {
            button_style.backgroundColor = 'white'
            button_style.color = 'black'
         }
         const button = <styles.LevelButton
            style={button_style}
            key={`button-${level_index}`}
            onClick={e => on_level_changed(level_index)}>
            {level_index}
         </styles.LevelButton>
         button_list.push(button)
      }
      return <styles.LevelSelectorWrapper>
         {button_list}
      </styles.LevelSelectorWrapper>
   }
}

export default LevelSelector;

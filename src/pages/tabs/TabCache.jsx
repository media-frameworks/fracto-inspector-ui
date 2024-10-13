import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";

import {CoolStyles} from "common/ui/CoolImports";
import FractoIndexedTiles from "../../fracto/common/data/FractoIndexedTiles";
import FractoUtil from "../../fracto/common/FractoUtil";
import CoolTable, {CELL_ALIGN_CENTER, CELL_TYPE_NUMBER} from "../../common/ui/CoolTable";
import FractoTileAutomate, {CONTEXT_SIZE_PX} from "../../fracto/common/tile/FractoTileAutomate";

const ContentWrapper = styled(CoolStyles.Block)`
   padding: 0.5rem;
   background-color: white;
   text-align: left;
`
const NO_CACHE_TABLE_COLUMNS = [
   {
      id: "level",
      label: "level",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
   {
      id: "no_cache",
      label: "no cache",
      type: CELL_TYPE_NUMBER,
      width_px: 40,
      align: CELL_ALIGN_CENTER
   },
]

export class TabCache extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      loading_no_cache: true,
      tiles: [],
      tile_index: 0,
      selected_level: 0
   }

   static no_cache_tiles = null;

   componentDidMount() {
      if (!TabCache.no_cache_tiles) {
         TabCache.no_cache_tiles = []
         for (let level = 0; level < 50; level++) {
            TabCache.no_cache_tiles[level] = {}
         }
         FractoIndexedTiles.load_no_cache(short_codes => {
            console.log('no_cache short codes:', short_codes.length)
            short_codes.forEach(short_code => {
               const level = short_code.length
               TabCache.no_cache_tiles[level][short_code] = {
                  short_code,
                  bounds: FractoUtil.bounds_from_short_code(short_code)
               }
            })
            this.setState({loading_no_cache: false})
         })
      } else {
         this.setState({loading_no_cache: false})
      }
   }

   load_cache_tiles = (level) => {
      const level_tiles = TabCache.no_cache_tiles[level]
      const tiles = Object.keys(level_tiles)
         .map(short_code => {
            return {short_code, bounds: FractoUtil.bounds_from_short_code(short_code)}
         })
         .sort((a, b) => {
            return a.bounds.left === b.bounds.left ?
               (a.bounds.top > b.bounds.top ? -1 : 1) :
               (a.bounds.left > b.bounds.left ? 1 : -1)
         })
      this.setState({
         tiles,
         tile_index: 0,
         selected_level: level
      });
   }

   render_no_cache = () => {
      const no_cache_data = []
      TabCache.no_cache_tiles.forEach((level_tiles, level) => {
         const tiles_in_level = Object.keys(level_tiles)
         if (!tiles_in_level.length) {
            return;
         }
         const no_cache_link = <CoolStyles.LinkSpan
            onClick={e => this.load_cache_tiles(level)}>
            {tiles_in_level.length}
         </CoolStyles.LinkSpan>
         no_cache_data.push({
            level, no_cache: no_cache_link
         })
      })
      return <CoolStyles.InlineBlock>
         <CoolTable
            data={no_cache_data}
            columns={NO_CACHE_TABLE_COLUMNS}
         />
      </CoolStyles.InlineBlock>
   }

   on_select_tile = (new_index, cb) => {
      this.setState({tile_index: new_index})
      setTimeout(() => {
         if (cb) {
            cb(true)
         }
      }, 50)
   }

   hit_cache = (tile, cb) => {
      setTimeout(() => {
         if (cb) {
            cb(true)
         }
      }, 500)
   }

   render() {
      const {loading_no_cache, tiles, selected_level, tile_index} = this.state
      if (loading_no_cache) {
         return "loading short codes..."
      }
      const no_cache = this.render_no_cache()
      const generator = tiles.length
         ? <FractoTileAutomate
            tile_action={this.hit_cache}
            tile_index={tile_index}
            level={selected_level}
            on_tile_select={this.on_select_tile}
            tile_size_px={CONTEXT_SIZE_PX}
            all_tiles={tiles}
         /> : []
      return <ContentWrapper>{no_cache}{generator}</ContentWrapper>
   }
}

export default TabCache;

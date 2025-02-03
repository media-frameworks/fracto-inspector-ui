import React, {Component} from 'react';
import PropTypes from 'prop-types';
// import styled from "styled-components";

// import {CoolStyles} from "common/ui/CoolImports";
import LevelSelector from "./ui/LevelSelector";
import {TabUiStyles as styles} from "../styles/TabUiStyles";
import FractoIndexedTiles from "../../fracto/common/data/FractoIndexedTiles";
import FractoTileAutomate, {CONTEXT_SIZE_PX} from "../../fracto/common/tile/FractoTileAutomate";
// import FractoMruCache from "../../fracto/common/data/FractoMruCache";
import FractoTileRender from "../../fracto/common/tile/FractoTileRender";
import FractoTileCache from "../../fracto/common/data/FractoTileCache";

export class TabInventory extends Component {

   static propTypes = {
      width_px: PropTypes.number.isRequired,
      on_focal_point_changed: PropTypes.func.isRequired,
      on_scope_changed: PropTypes.func.isRequired,
   }

   state = {
      selected_level: -1,
      level_tiles: [],
      tile_index: 0,
      context_completed: null,
      tile_data: null,
      loading_tiles: false,
   }

   componentDidMount() {
   }

   go = () => {
      this.setState({in_harvest: true})
   }

   on_level_changed = (selected_level) => {
      const level_tiles = FractoIndexedTiles.tiles_in_level(selected_level)
      setTimeout(() => {
         this.setState({
            selected_level: selected_level,
            level_tiles,
            tile_index: 0,
         })
      }, 500)
   }

   on_select_tile = async (new_index, cb) => {
      const {tile_index, level_tiles} = this.state
      const tile = level_tiles[tile_index]
      const tile_data = await FractoTileCache.get_tile(tile.short_code)
      // FractoMruCache.get_tile_data(tile.short_code, tile_data => {
         this.setState({
            tile_index: new_index,
            tile_data
         })
         if (cb) {
            cb(true)
         }
      // })
   }

   wait_for_context = (short_code, cb) => {
      let countdown = 50;
      const interval = setInterval(() => {
         countdown--;
         if (!countdown) {
            clearInterval(interval)
            cb(false)
         }
         console.log('short_code, this.state.context_completed', short_code, this.state.context_completed)
         if (short_code === this.state.context_completed) {
            clearInterval(interval)
            cb(true)
         }
      }, 800)
   }

   inventory = (tile, cb) => {
      this.wait_for_context(tile.short_code, it_was_worth_it => {
         console.log('inventory tile, context loaded?', it_was_worth_it, tile)
         setTimeout(() => {
            cb(true)
         }, 800)
      })
   }

   on_render_tile = (tile, width_px) => {
      const {tile_data} = this.state
      return <FractoTileRender
         key={`render-${tile.short_code}`}
         tile={tile}
         width_px={width_px}
         tile_data={tile_data}/>
   }

   on_context_rendered = (canvas_buffer, ctx) => {
      const {tile_index, level_tiles} = this.state
      const tile = level_tiles[tile_index]
      setTimeout(() => {
         this.setState({context_completed: tile.short_code})
      }, 800)
   }

   render() {
      const {selected_level, level_tiles, tile_index, loading_tiles} = this.state
      const {width_px} = this.props;
      const level_selector = <LevelSelector
         width_px={width_px - 10}
         selected_level={selected_level}
         on_level_changed={this.on_level_changed}
      />
      const prompt_str = loading_tiles
         ? 'loading tile data...'
         : 'select level to begin'
      const prompt = selected_level < 3
         ? <styles.SelectPrompt>{prompt_str}</styles.SelectPrompt>
         : ''
      const header = <styles.InventoryHeader>
         {`Level ${selected_level} tiles: ${level_tiles.length}`}
      </styles.InventoryHeader>
      const automate = !level_tiles.length ? '' :
         <FractoTileAutomate
            tile_action={this.inventory}
            tile_index={tile_index}
            level={selected_level}
            on_tile_select={this.on_select_tile}
            tile_size_px={512}
            on_render_tile={this.on_render_tile}
            all_tiles={level_tiles}
            on_context_rendered={this.on_context_rendered}
            // on_automate={this.on_automate}
         />
      return <styles.ContentWrapper>
         {level_selector}
         {prompt}
         {level_tiles.length ? header : ''}
         {automate}
      </styles.ContentWrapper>
   }
}

export default TabInventory;

// @flow
import * as React from 'react';
import {
  useCommand,
  useCommandWithOptions,
} from '../CommandPalette/CommandHooks';
import { type EventMetadata } from './EnumerateEventsMetadata';

type Props = {|
  onAddStandardEvent: () => void,
  onAddSubEvent: () => void,
  canAddSubEvent: boolean,
  onAddCommentEvent: () => void,
  allEventsMetadata: Array<EventMetadata>,
  onAddEvent: (eventType: string) => Array<gdBaseEvent>,
  onToggleDisabledEvent: () => void,
  canToggleEventDisabled: boolean,
  onRemove: () => void,
  canRemove: boolean,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  onToggleSearchPanel: () => void,
  onOpenSettings?: ?() => void,
|};

const ToolbarCommands = (props: Props) => {
  const { onAddEvent } = props;

  useCommand('ADD_STANDARD_EVENT', true, {
    handler: props.onAddStandardEvent,
  });

  useCommand('ADD_SUBEVENT', props.canAddSubEvent, {
    handler: props.onAddSubEvent,
  });

  useCommand('ADD_COMMENT_EVENT', true, {
    handler: props.onAddCommentEvent,
  });

  useCommand('TOGGLE_EVENT_DISABLED', props.canToggleEventDisabled, {
    handler: props.onToggleDisabledEvent,
  });

  useCommandWithOptions('CHOOSE_AND_ADD_EVENT', true, {
    generateOptions: React.useCallback(
      () =>
        props.allEventsMetadata.map(metadata => ({
          text: metadata.fullName,
          handler: () => {
            onAddEvent(metadata.type);
          },
        })),
      [props.allEventsMetadata, onAddEvent]
    ),
  });

  useCommand('DELETE_SELECTION', props.canRemove, {
    handler: props.onRemove,
  });

  useCommand('EVENTS_EDITOR_UNDO', props.canUndo, {
    handler: props.undo,
  });

  useCommand('EVENTS_EDITOR_REDO', props.canRedo, {
    handler: props.redo,
  });

  useCommand('SEARCH_EVENTS', true, {
    handler: props.onToggleSearchPanel,
  });

  useCommand('OPEN_EXTENSION_SETTINGS', !!props.onOpenSettings, {
    handler: props.onOpenSettings || (() => {}),
  });

  return null;
};

export default ToolbarCommands;

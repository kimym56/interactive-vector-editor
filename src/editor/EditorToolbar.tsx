import type { SvgIconComponent } from "@mui/icons-material";
import AdjustRounded from "@mui/icons-material/AdjustRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OpenWithRounded from "@mui/icons-material/OpenWithRounded";
import PentagonOutlined from "@mui/icons-material/PentagonOutlined";
import RedoRounded from "@mui/icons-material/RedoRounded";
import UndoRounded from "@mui/icons-material/UndoRounded";
import {
  Box,
  Button,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { toolbarControlHeight } from "../designSystem";
import type { EditorMode, EditorState } from "./editorModel";
import { getCanCompletePolygon } from "./editorModel";

type ToolDefinition = {
  mode: EditorMode;
  label: string;
  hint: string;
  Icon: SvgIconComponent;
};

type EditorToolbarProps = {
  state: EditorState;
  onModeChange: (mode: EditorMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onComplete: () => void;
  onCancelDraft: () => void;
};

const tools: ToolDefinition[] = [
  { mode: "point", label: "Point", hint: "Click to place a point", Icon: AdjustRounded },
  { mode: "polygon", label: "Polygon", hint: "Click to add vertices, then Complete", Icon: PentagonOutlined },
  { mode: "move", label: "Move", hint: "Drag a point or polygon", Icon: OpenWithRounded },
  { mode: "delete", label: "Delete", hint: "Click an object to remove it", Icon: DeleteOutlineRounded }
];

export function EditorToolbar({
  state,
  onModeChange,
  onUndo,
  onRedo,
  onComplete,
  onCancelDraft
}: EditorToolbarProps) {
  const canComplete = getCanCompletePolygon(state);
  const canCancelDraft = state.mode === "polygon" && state.draftPolygon.length > 0;
  const activeTool = tools.find((tool) => tool.mode === state.mode) ?? tools[0];

  function handleModeChange(mode: EditorMode | null) {
    if (mode) {
      onModeChange(mode);
    }
  }

  return (
    <ToolbarSurface data-testid="toolbar-surface">
      <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
        <ToolGroup
          exclusive
          value={state.mode}
          aria-label="Drawing tools"
          onChange={(_, mode) => handleModeChange(mode)}
        >
          {tools.map(({ mode, label, Icon }) => (
            <ToggleButton key={mode} value={mode} aria-label={label}>
              <Icon fontSize="small" aria-hidden="true" />
              {label}
            </ToggleButton>
          ))}
        </ToolGroup>

        <ButtonGroupSurface aria-label="History controls">
          <Button
            type="button"
            variant="text"
            color="secondary"
            startIcon={<UndoRounded />}
            onClick={onUndo}
            disabled={state.undoStack.length === 0}
            aria-label="Undo"
          >
            Undo
          </Button>
          <Button
            type="button"
            variant="text"
            color="secondary"
            startIcon={<RedoRounded />}
            onClick={onRedo}
            disabled={state.redoStack.length === 0}
            aria-label="Redo"
          >
            Redo
          </Button>
        </ButtonGroupSurface>

        {canCancelDraft && (
          <DraftControls>
            <Chip
              size="small"
              label={`${state.draftPolygon.length} ${state.draftPolygon.length === 1 ? "vertex" : "vertices"}`}
            />
            <PolygonActionButtons
              canComplete={canComplete}
              canCancelDraft={canCancelDraft}
              onComplete={onComplete}
              onCancelDraft={onCancelDraft}
            />
          </DraftControls>
        )}
      </Stack>

      <Typography color="text.secondary" fontSize={14} aria-live="polite">
        {canCancelDraft ? "Keep clicking to add vertices." : activeTool.hint}
      </Typography>
    </ToolbarSurface>
  );
}

function PolygonActionButtons({
  canComplete,
  canCancelDraft,
  onComplete,
  onCancelDraft
}: {
  canComplete: boolean;
  canCancelDraft: boolean;
  onComplete: () => void;
  onCancelDraft: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="contained"
        startIcon={<CheckRounded />}
        onClick={onComplete}
        disabled={!canComplete}
        aria-label="Complete"
      >
        Complete
      </Button>
      <Button
        type="button"
        variant="text"
        color="secondary"
        startIcon={<CloseRounded />}
        onClick={onCancelDraft}
        disabled={!canCancelDraft}
        aria-label="Cancel"
      >
        Cancel
      </Button>
    </>
  );
}

const ToolbarSurface = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(1.25, 0)
}));

const ToolGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  maxWidth: "100%",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    borderRadius: theme.shape.borderRadius
  }
}));

const ButtonGroupSurface = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(0.5),
  maxWidth: "100%",
  padding: theme.spacing(0.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}));

const DraftControls = styled(ButtonGroupSurface)(({ theme }) => ({
  borderColor: alpha(theme.palette.primary.main, 0.28),
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  "& .MuiChip-root": {
    height: toolbarControlHeight,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.secondary
  }
}));

import { useCallback} from "react";
import { useDialog } from "../providers/dialog";
import { DialogSearchList } from "../dialog-search-list";
import  { Mode } from "@daycode/database/enums";
import type { SupportedChatModelId } from "@daycode/shared";

type ModelDialogContentProps = {
  models: SupportedChatModelId[];
  onSelectModel: (modelId:SupportedChatModelId) => void;
}


export const ModelDialogContent = ({models,onSelectModel}:ModelDialogContentProps) => {
  const dialog = useDialog();
 
  const handleSelect = useCallback(
    (modelId: SupportedChatModelId) => {
      onSelectModel(modelId)
      dialog.closeDialog();
    },
    [onSelectModel, dialog],
  );


  return (
    <DialogSearchList
      items={models}
      onSelect={handleSelect}
      filterFn={(modelId, query) =>
        modelId.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(modelId, isSelected) => (
        <text selectable={false} fg={isSelected ? "black" : "white"}>
          {modelId}
        </text>
      )}
      getKey={(modelId) => modelId}
      placeholder="Search models"
      emptyText="No matching models"
    />
  );
};

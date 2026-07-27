import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";

type FileReloadedNoticeDialogProps = {
  filePath: string;
  onDismiss: () => void;
  open: boolean;
};

function FileReloadedNoticeDialog({ filePath, onDismiss, open }: FileReloadedNoticeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Reloaded</DialogTitle>
          <DialogDescription>
            This file changed outside Nexus and has been reloaded from disk.
          </DialogDescription>
        </DialogHeader>
        <p className="nexus-dialog-path">{filePath}</p>
        <DialogFooter>
          <Button type="button" onClick={onDismiss}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FileReloadedNoticeDialog;

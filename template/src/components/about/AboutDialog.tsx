import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "../ui/dialog";
import { APP_NAME, APP_ORGANIZATION, APP_TAGLINE } from "../../lib/appInfo";

type AboutDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function AboutDialog({ onOpenChange, open }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nexus-about-dialog">
        <div className="nexus-about-content">
          {/* Drop an app icon in beside the copy once the project has one:
              import appIcon from "../../../icon.png";
              <img className="nexus-about-icon" src={appIcon} alt="" /> */}
          <div className="nexus-about-copy">
            <p className="nexus-about-organization">{APP_ORGANIZATION}</p>
            <DialogTitle className="nexus-about-title">{APP_NAME}</DialogTitle>
            <DialogDescription className="nexus-about-description">{APP_TAGLINE}</DialogDescription>
          </div>
        </div>

        <DialogFooter className="nexus-about-footer">
          <span className="nexus-about-copyright">© {APP_ORGANIZATION}</span>
          <Button type="button" onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AboutDialog;

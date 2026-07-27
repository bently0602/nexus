import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from "../ui/dialog";
import nexusIcon from "../../../nexus.png";

type AboutDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function AboutDialog({ onOpenChange, open }: AboutDialogProps) {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void window.nexus?.getAppVersion().then((value) => {
      if (active) {
        setVersion(value);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nexus-about-dialog">
        <div className="nexus-about-content">
          <img className="nexus-about-icon" src={nexusIcon} alt="" />
          <div className="nexus-about-copy">
            <p className="nexus-about-organization">Umpecca</p>
            <DialogTitle className="nexus-about-title">Nexus</DialogTitle>
            <DialogDescription className="nexus-about-description">
              A visual-first Markdown editor.
            </DialogDescription>
            <p className="nexus-about-release">
              Release <strong>{version ? `v${version}` : "Development"}</strong>
            </p>
          </div>
        </div>

        <DialogFooter className="nexus-about-footer">
          <span className="nexus-about-copyright">© Umpecca</span>
          <Button type="button" onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AboutDialog;

import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import type { Action } from "@reduxjs/toolkit";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import type { AppState } from "../../app/types";
import { closeCoefficientHelpModal } from "./coefficientHelpModalOpenSlice";

export default function CoefficientHelpModal(): EmotionJSX.Element {
  const isOpen = useAppSelector(
    (state: AppState): boolean => state.coefficientHelpModal.open
  );
  const dispatch = useAppDispatch();
  const handleClose = (event: object): Action<string> =>
    dispatch(closeCoefficientHelpModal(event));
  const modalContent = (
    <React.Fragment>
      <DialogContent>
        <Typography>
          The correlation between the estimated time for each task and the
          actual time they took tells us how well we are at estimating the
          amount of time it will take for things to be completed. The closer the
          number is to 1 or -1, the stronger the correlation. The closer to 0,
          the weaker the correlation.
        </Typography>
      </DialogContent>
      {/* 1 */}
      <DialogContent dividers>
        <Typography variant="h6">1</Typography>
        <Typography>
          Having a correlation of 1 would mean we're perfectly estimating the
          time every time. This is obviously the ideal we all want to find
          ourselves in.
        </Typography>
        <Typography>
          Unfortunately, reaching a 1 is impossible. It's inevitable that
          something will go wrong at some point. Anything below ~0.6, though, is
          a weak correlation and tells us we can't realistically rely on those
          estimates.
        </Typography>
        <Typography>
          If someone said "I am 50% confident this estimate is right", would you
          trust it? At what percentage would you start to trust it?
        </Typography>
      </DialogContent>
      {/* 0 */}
      <DialogContent dividers>
        <Typography variant="h6">0</Typography>
        <Typography>
          Having a correlation of 0 would mean we're as bad as we could possibly
          be at estimating. It would effectively be no different than using
          random numbers for the estimates.
        </Typography>
        <Typography>
          If someone said "I am 0% confident this estimate is right", would you
          trust it?
        </Typography>
        <Typography>
          If this is where you find yourself, it may be best to no longer try to
          estimate, since it doesn't help establish useful timelines and may be
          causing other issues (e.g. adding stress, which leads to more
          mistakes). The time normally spent coming up with estimates could
          instead be put towards getting productive work done.
        </Typography>
      </DialogContent>
      {/* -1 */}
      <DialogContent dividers>
        <Typography variant="h6">-1</Typography>
        <Typography>
          Having a correlation of -1 would mean we're not just wrong every time,
          but that in giving lower estimates, we end up somehow consistently
          taking longer than the tasks we believed would be much more time
          consuming. The scale is effectively backwards.
        </Typography>
        <Typography>
          A coefficient of -0.5 could be considered in some contexts to be worse
          than 0.5, despite it telling you roughly the same thing, because it
          signals that the people giving the estimates (or the people using the
          estimates to make decisions) have a backwards understanding of how
          things work.
        </Typography>
        <Typography>
          If you're in the negative range, it may be best to take a good look at
          what is happening where the work is actually being done. Are people
          taking less care because of the the pressumed ease or simplicity? Is
          the lower estimated work being deprioritized regularly? Is this
          because it is seen as less important? If it is less important, why was
          it scheduled? Are the consequences of context switching not being
          factored in?
        </Typography>
      </DialogContent>
    </React.Fragment>
  );
  return (
    <div>
      <Dialog
        keepMounted={true}
        open={isOpen}
        onClose={handleClose}
        data-testid="coefficient-help-modal"
      >
        <DialogTitle data-testid="modal-modal-title">
          Correlation of Estimated to Actual Times
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{modalContent}</DialogContent>
      </Dialog>
    </div>
  );
}

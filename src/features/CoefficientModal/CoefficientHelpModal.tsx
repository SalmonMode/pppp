import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeCoefficientHelpModal } from "./coefficientHelpModalOpenSlice";

export default function CoefficientHelpModal() {
  const isOpen = useAppSelector((state) => state.coefficientHelpModal.open);
  const dispatch = useAppDispatch();
  return (
    <Modal
      keepMounted={true}
      open={isOpen}
      onClose={(event) => dispatch(closeCoefficientHelpModal(event))}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box data-testid="coefficient-help-modal" sx={modalStyles}>
        <div css={modalInnerStyles}>
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Correlation of Estimated to Actual Times
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            The correlation between the estimated time for each task and the
            actual time they took tells us how well we are at estimating the
            amount of time it will take for things to be completed. The closer
            the number is to 1 or -1, the stronger the correlation. The closer
            to 0, the weaker the correlation.
          </Typography>
          {/* 1 */}
          <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
            1
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Having a correlation of 1 would mean we're perfectly estimating the
            time every time. This is obviously the ideal we all want to find
            ourselves in.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Unfortunately, reaching a 1 is impossible. It's inevitable that
            something will go wrong at some point. Anything below ~0.6, though,
            is a weak correlation and tells us we can't realistically rely on
            those estimates.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            If someone said "I am 50% confident this estimate is right", would
            you trust it? At what percentage would you start to trust it?
          </Typography>
          {/* 0 */}
          <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
            0
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Having a correlation of 0 would mean we're as bad as we could
            possibly be at estimating. It would effectively be no different than
            using random numbers for the estimates.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            If someone said "I am 0% confident this estimate is right", would
            you trust it?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            If this is where you find yourself, it may be best to no longer try
            to estimate, since it doesn't help establish useful timelines and
            may be causing other issues (e.g. adding stress, which leads to more
            mistakes). The time normally spent coming up with estimates could
            instead be put towards getting productive work done.
          </Typography>
          {/* -1 */}
          <Typography id="modal-modal-description" variant="h6" sx={{ mt: 2 }}>
            -1
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Having a correlation of -1 would mean we're not just wrong every
            time, but that in giving lower estimates, we end up somehow
            consistently taking longer than the tasks we believed would be much
            more time consuming. The scale is effectively backwards.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            A coefficient of -0.5 could be considered in some contexts to be
            worse than 0.5, despite it telling you roughly the same thing,
            because it signals that the people giving the estimates (or the
            people using the estimates to make decisions) have a backwards
            understanding of how things work.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            If you're in the negative range, it may be best to take a good look
            at what is happening where the work is actually being done. Are
            people taking less care because of the the pressumed ease or
            simplicity? Is the lower estimated work being deprioritized
            regularly? Is this because it is seen as less important? If it is
            less important, why was it scheduled? Are the consequences of
            context switching not being factored in?
          </Typography>
        </div>
      </Box>
    </Modal>
  );
}

const modalStyles = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  maxHeight: "100%",
  overflowY: "auto",
};
const modalInnerStyles = {
  margin: 20,
};

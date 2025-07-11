
import { AnimatePresence } from "motion/react"
import ModalViewerJSON from "../ui/ModalViewer"
interface ModalesProps {
    openAll: boolean,

}



export default function ModalesView () {
    return(
        <AnimatePresence>
        {openAll && (
          <ModalViewerJSON
            value={value}
            openAll={openAll}
            setOpenAll={setOpenAll}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDecode && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ scale: 0 }}
            variants={overlayVariants}
            className="absolute inset-0  z-[887] backdrop-blur-3xl bg-black/50 grid place-content-center gap-5 "
          >
            <button
              className="btn-icon top-7  right-6 p-2 fixed z-50"
              onClick={() => setIsDecode(!isDecode)}
            >
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
            <JWTDecode />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpenDiffText && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ scale: 0 }}
            variants={overlayVariants}
            className="absolute inset-0  z-[887] backdrop-blur-3xl bg-black/50 grid gap-5 "
          >
            <button
              className="btn-icon top-7  right-6 p-2 fixed z-50"
              onClick={() => setIsOpenDiffText(!isOpenDiffText)}
            >
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
            <ModalViewer />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpenDiff && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit={{ scale: 0 }}
            variants={overlayVariants}
            className="absolute inset-0  z-[887] backdrop-blur-3xl bg-black/50 grid place-content-center "
          >
            <button
              className="btn-icon top-7  right-6 p-2 fixed z-50"
              onClick={() => setIsOpenDiff(!isOpenDiff)}
            >
              <Icon icon="tabler:x" width="24" height="24" />
            </button>
            <JsonDiffLazy />
          </motion.div>
        )}
      </AnimatePresence>
    )
}
import Modal, { ModalHeader } from './Modal'

// Plain-language privacy policy shown in-app (also used as the App Store policy).
export default function PrivacyModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title="Privacy Policy" subtitle="Last updated July 24, 2026" onClose={onClose} />
      <div className="space-y-4 text-sm leading-relaxed pl-text">
        <p>
          Planda is a study planner for students. This policy explains what
          information the app handles and how it is used. The guiding principle
          is simple: your data is yours, and it is not sold.
        </p>

        <div>
          <h3 className="mb-1 font-bold">What is stored</h3>
          <p className="pl-text-muted">
            Your planner content (classes, assignments, tasks, focus sessions,
            grades, milestones, and profile details) is stored locally on your
            device. If you sign in, your name and email address are handled by
            the authentication provider (Google, Apple, or email sign-in) solely
            to identify your account.
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-bold">How it is used</h3>
          <p className="pl-text-muted">
            Information is used only to run the planner and to generate
            personalized study suggestions. It is never sold or shared for
            advertising.
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-bold">Ask Planda (AI)</h3>
          <p className="pl-text-muted">
            When you chat with Ask Planda, your message and a short summary of
            your planner may be sent to a third-party AI provider to generate a
            response. This content is used only to answer you and is not used for
            advertising.
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-bold">Third-party services</h3>
          <p className="pl-text-muted">
            Planda uses an authentication provider for optional sign-in and an AI
            provider for the assistant. These services process only what is
            needed to perform their function.
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-bold">Your control</h3>
          <p className="pl-text-muted">
            You can export a copy of your data at any time, and you can delete
            your account and all associated data from the Account screen. Deleting
            your account removes your sign-in record and clears the data on your
            device.
          </p>
        </div>

        <div>
          <h3 className="mb-1 font-bold">Contact</h3>
          <p className="pl-text-muted">
            Questions about this policy can be sent to the app's support contact
            listed on its store page.
          </p>
        </div>
      </div>
    </Modal>
  )
}

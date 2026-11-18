import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";

export function StartPage() {
  return (
    <section className="panel hero">
      <div className="start-hero__content" style={{ paddingBottom: '16px' }}>
        <PageHeader
          kicker="Play Now"
          title="Scribble Game"
          description="Create a new room to play with friends or join an existing game using a room code. Take turns drawing and guessing words in real-time."
        />

        <div className="button-row button-row--hero">
          <Link className="button button--primary" to="/create-room">
            New Room
          </Link>
          <Link className="button button--secondary" to="/join-room">
            Join Room
          </Link>
        </div>
      </div>

      <div className="hero__grid" style={{ marginTop: '16px' }}>
        <Card title="Draw" badge="Step 1">
          <p>Get a word and sketch it out on the canvas. No artistic skills required!</p>
        </Card>

        <Card title="Guess" badge="Step 2">
          <p>Type your guesses as fast as you can when other players are drawing.</p>
        </Card>

        <Card title="Win" badge="Step 3">
          <p>Score the most points across all rounds to be crowned the winner.</p>
        </Card>
      </div>
    </section>
  );
}

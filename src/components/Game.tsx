import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import seedrandom from "seedrandom";
import { countries, countriesWithImage } from "../domain/countries";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import { GuessRow } from "./GuessRow";
import * as geolib from "geolib";
import { Share } from "./Share";

function getDayString() {
  return DateTime.now().toFormat("yyyy-MM-dd");
}

export function Game() {
  const dayString = useMemo(getDayString, []);
  const country = useMemo(
    () =>
      countriesWithImage[
        Math.floor(seedrandom.alea(dayString)() * countriesWithImage.length)
      ],
    [dayString]
  );

  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, addGuess] = useGuesses(dayString);

  const gameEnded = guesses.length === 6 || guesses.at(-1)?.distance === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const guessedCountry = countries.find(
        (country) => country.name.toLowerCase() === currentGuess.toLowerCase()
      );

      if (guessedCountry == null) {
        toast.error("Unknown country!");
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(guessedCountry, country),
      };

      addGuess(newGuess);
      setCurrentGuess("");

      if (newGuess.distance === 0) {
        toast.success("Well done!");
      }
    },
    [addGuess, country, currentGuess]
  );

  useEffect(() => {
    if (guesses.length === 6 && guesses.at(-1)!.distance > 0) {
      toast.info(country.name.toUpperCase(), { autoClose: false });
    }
  }, [country.name, guesses]);

  return (
    <div className="flex flex-col mx-2">
      <img
        className="max-h-52 my-1"
        alt="country to guess"
        src={`images/countries/${country.code.toLowerCase()}/vector.svg`}
      />
      <div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from(Array(6).keys()).map((index) => (
            <GuessRow key={index} guess={guesses[index]} />
          ))}
        </div>
      </div>
      <div className="my-2">
        {gameEnded ? (
          <Share guesses={guesses} dayString={dayString} />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <CountryInput
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100"
                type="submit"
              >
                🌍 Guess
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

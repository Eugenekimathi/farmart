"""Marketplace-grounded assistant with an optional OpenAI provider adapter."""
import os
import re
import uuid

from app.models.animals import Animal


def _marketplace_context(message):
    query = Animal.query.filter_by(status="AVAILABLE")
    lower = message.lower()
    budget = re.search(r"(?:under|below|less than)\s*(?:kes|ksh)?\s*([\d,]+)", lower)
    if budget:
        query = query.filter(Animal.price <= int(budget.group(1).replace(",", "")))

    listings = query.order_by(Animal.price.asc()).limit(5).all()
    return [{"id": animal.id, "name": animal.name, "price": str(animal.price), "location": animal.location} for animal in listings]


def _fallback_answer(message, listings):
    if listings:
        summary = ", ".join(f"{item['name']} (KSh {item['price']}, {item['location']})" for item in listings)
        return f"I found {len(listings)} available listing(s): {summary}. Open the Store to compare the full details and farmer information."
    if any(word in message.lower() for word in ("dairy", "cow", "goat", "breed")):
        return "For dairy livestock, compare breed, age, health records, production history, location, and the farmer's details. Tell me your budget and county and I can narrow the options."
    return "I can help you compare available livestock, explain buying steps, and suggest what to check before purchase. Tell me the animal type, your budget, and location."


def respond(message, conversation_id=None):
    listings = _marketplace_context(message)
    # An external model is deliberately optional: Farmart continues to provide
    # real marketplace answers when no provider credentials are configured.
    if os.getenv("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            context = _fallback_answer(message, listings)
            response = OpenAI().responses.create(
                model=os.getenv("OPENAI_MODEL", "gpt-5"),
                input=f"You are Farmart's helpful livestock marketplace assistant. Use this verified marketplace context: {context}\n\nCustomer: {message}",
            )
            answer = response.output_text
        except Exception:
            answer = _fallback_answer(message, listings)
    else:
        answer = _fallback_answer(message, listings)
    return {"conversation_id": conversation_id or str(uuid.uuid4()), "message": answer, "metadata": {"recommendations": listings, "provider": "openai" if os.getenv("OPENAI_API_KEY") else "marketplace"}}

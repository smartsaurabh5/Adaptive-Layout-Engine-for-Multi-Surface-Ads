-- AdaptFlow Schema Migration V2: Seed Default Surfaces

INSERT INTO surfaces (id, name, width, height, type, min_supported_width)
VALUES
    ('surface-banner', 'Web Banner (Medium Rectangle)', 300, 250, 'banner', 200),
    ('surface-leaderboard', 'Leaderboard (Web Display)', 728, 90, 'leaderboard', 468),
    ('surface-square', 'Square (Feed & Instagram Post)', 1080, 1080, 'square', 400),
    ('surface-story', 'Vertical Story (Reels, TikTok, Stories)', 1080, 1920, 'story', 360),
    ('surface-skyscraper', 'Skyscraper (Desktop Sidebar)', 160, 600, 'skyscraper', 120)
ON CONFLICT (id) DO NOTHING;

package groupone.soundwaveproject.catalog.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Utility helper for normalizing text and removing Vietnamese diacritical marks
 * to enable accent-insensitive and slug-compatible catalog search queries.
 */
public final class SearchNormalizeUtil {

    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");

    private SearchNormalizeUtil() {}

    /**
     * Removes Vietnamese diacritical marks (chữ có dấu -> chữ không dấu).
     * <p>
     * Example: "Tìm Em" -> "Tim Em", "Đại Lộ Đông Tây" -> "Dai Lo Dong Tay"
     *
     * @param input Raw text containing diacritical marks.
     * @return Clean text without accents.
     */
    public static String removeAccents(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Replace special Vietnamese characters that NFD does not decompose
        normalized = normalized.replace('đ', 'd').replace('Đ', 'D').replace('ð', 'd');
        return DIACRITICS_PATTERN.matcher(normalized).replaceAll("").trim();
    }

    /**
     * Converts a search keyword into a clean lowercase hyphenated slug form.
     * <p>
     * Example: "Tìm Em" -> "tim-em", "tim em" -> "tim-em"
     *
     * @param input Raw search query.
     * @return Clean lowercase hyphenated slug keyword.
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String withoutAccents = removeAccents(input).toLowerCase();
        String slug = NON_ALPHANUMERIC.matcher(withoutAccents).replaceAll("-");
        return slug.replaceAll("^-+|-+$", "");
    }

    /**
     * Converts a search keyword into a clean lowercase space-separated unaccented string.
     * <p>
     * Example: "Tìm  Em" -> "tim em", "tim em" -> "tim em"
     *
     * @param input Raw search query.
     * @return Clean lowercase space-separated unaccented keyword.
     */
    public static String toUnaccented(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String withoutAccents = removeAccents(input).toLowerCase();
        return withoutAccents.replaceAll("\\s+", " ").trim();
    }
}


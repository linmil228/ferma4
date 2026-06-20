const TYPO_HANGING_WORDS = [
    'а', 'без', 'в', 'во', 'г', 'д', 'до', 'для', 'за', 'и', 'из', 'к', 'ко',
    'на', 'над', 'не', 'ни', 'но', 'о', 'об', 'обо', 'от', 'по', 'под', 'при',
    'про', 'с', 'со', 'у', 'как', 'что', 'ли', 'же', 'бы', 'то', 'или', 'мы',
];

function fixTypography(text) {
    if (!text) return '';

    let result = text;
    TYPO_HANGING_WORDS.forEach((word) => {
        const re = new RegExp(`(^|[\\s(—–-])(${word}) `, 'gi');
        result = result.replace(re, `$1$2\u00A0`);
    });

    return result;
}

window.fixTypography = fixTypography;

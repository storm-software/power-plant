/* Stub mimalloc for Rust FFI builds without vendored mimalloc.
 * Production upstream links real mimalloc with CBM_BIND_TS_ALLOCATOR=1. */
#ifndef CBM_MIMALLOC_SHIM_H
#define CBM_MIMALLOC_SHIM_H

#include <stddef.h>
#include <stdlib.h>

static inline void *mi_malloc(size_t size) {
    return malloc(size);
}
static inline void *mi_calloc(size_t count, size_t size) {
    return calloc(count, size);
}
static inline void *mi_realloc(void *p, size_t size) {
    return realloc(p, size);
}
static inline void mi_free(void *p) {
    free(p);
}
static inline size_t mi_usable_size(void *p) {
    (void)p;
    return 0;
}

#endif /* CBM_MIMALLOC_SHIM_H */

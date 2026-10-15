-- ======================================================================================
-- SoundWave Data Fix Script: 20261014_fix_tracks_and_track_submissions.sql
-- Mục đích: Chuẩn hóa toàn bộ dữ liệu giữa bảng tracks và track_submissions:
-- 1. Bổ sung các bản ghi track_submissions (APPROVED) cho 10 bài hát đã PUBLISHED.
-- 2. Đồng bộ submitted_by_user_id khớp chính xác với uploader_user_id của bài hát.
-- 3. Chuẩn hóa approved_at trong bảng tracks (gỡ ngày duyệt cho bài REJECTED, bù ngày duyệt cho bài PUBLISHED).
-- 4. Dọn dẹp các bài hát rác/trùng lặp (Track #24, #27, #28).
-- ======================================================================================

BEGIN;

DO $$
DECLARE
    v_staff_id BIGINT;
    v_now TIMESTAMP := timezone('UTC', CURRENT_TIMESTAMP(3));
BEGIN
    -- 1. Lấy ID của tài khoản Staff kiểm duyệt mặc định
    SELECT u.id INTO v_staff_id
    FROM app_users u
    JOIN roles r ON u.role_id = r.id
    WHERE r.code = 'STAFF'
    ORDER BY u.id
    LIMIT 1;

    IF v_staff_id IS NULL THEN
        v_staff_id := 2;
    END IF;

    -- ==================================================================================
    -- 2. CHUẨN HÓA CỘT APPROVED_AT TRONG BẢNG TRACKS
    -- ==================================================================================
    -- Bài #1 bị REJECTED -> gỡ bỏ approved_at
    UPDATE tracks
    SET approved_at = NULL, updated_at = v_now
    WHERE id = 1 AND publication_status = 'REJECTED';

    -- Bài #3 và #4 đã PUBLISHED nhưng approved_at bị NULL -> bù thời điểm duyệt hợp lệ
    UPDATE tracks
    SET approved_at = created_at + INTERVAL '15 minutes', updated_at = v_now
    WHERE id IN (3, 4) AND publication_status = 'PUBLISHED' AND approved_at IS NULL;

    -- ==================================================================================
    -- 3. ĐỒNG BỘ SUBMITTED_BY_USER_ID TRONG TRACK_SUBMISSIONS
    -- ==================================================================================
    -- Track #14 & #15 (LAVIEM): người tải là Low G (ID 19)
    UPDATE track_submissions
    SET submitted_by_user_id = 19
    WHERE track_id IN (14, 15);

    -- Track #26 (One more time one more chance): người tải là Masayoshi Yamazaki (ID 18)
    UPDATE track_submissions
    SET submitted_by_user_id = 18
    WHERE track_id = 26;

    -- ==================================================================================
    -- 4. BỔ SUNG TRACK_SUBMISSIONS (APPROVED) CHO 10 BÀI HÁT ĐÃ PUBLISHED
    -- ==================================================================================
    -- Thêm cho các track PUBLISHED chưa từng có submission:
    -- Track #3, #4 (Minh An Acoustic)
    -- Track #6 (MCK), #7 (HIEUTHUHAI), #8 (Uyên Linh), #9 (Hngle)
    -- Track #10 (Sơn Tùng M-TP), #11 (Yorushika), #12 (Yoko Takahashi), #13 (YOASOBI)
    INSERT INTO track_submissions (
        track_id,
        submitted_by_user_id,
        reviewer_user_id,
        status,
        submitter_note,
        reviewer_note,
        rejection_reason,
        submitted_at,
        reviewed_at
    )
    SELECT
        t.id,
        t.uploader_user_id,
        v_staff_id,
        'APPROVED',
        'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.',
        'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.',
        NULL,
        t.created_at,
        COALESCE(t.approved_at, t.created_at + INTERVAL '15 minutes')
    FROM tracks t
    WHERE t.id IN (3, 4, 6, 7, 8, 9, 10, 11, 12, 13)
      AND NOT EXISTS (
          SELECT 1 FROM track_submissions ts WHERE ts.track_id = t.id
      );

    -- ==================================================================================
    -- 5. DỌN DẸP BÀI HÁT TRÙNG LẶP / BẢN NHÁP RÁC
    -- ==================================================================================
    -- Xóa submission của Track #24 (bản trùng lặp PENDING)
    DELETE FROM track_submissions WHERE track_id = 24;
    -- Xóa Track #24 (One more time one more chance trùng lặp)
    DELETE FROM tracks WHERE id = 24;

    -- Xóa Track #27 (One more time one more chance bản nháp không có cover)
    DELETE FROM tracks WHERE id = 27;

    -- Xóa Track #28 (MỘT MÁI TAY CHẮN bản nháp không có cover)
    DELETE FROM tracks WHERE id = 28;

END $$;

COMMIT;
